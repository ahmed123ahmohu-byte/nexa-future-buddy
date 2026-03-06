import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, LogOut, Sun, Moon, Menu, FileCode } from 'lucide-react';
import ChatMessage from '@/components/ChatMessage';
import ChatSidebar from '@/components/ChatSidebar';
import TypingIndicator from '@/components/TypingIndicator';
import CodePreview from '@/components/CodePreview';
import { streamChat, type ChatMessage as ChatMsg } from '@/lib/streamChat';
import { useChatSessions } from '@/hooks/useChatSessions';
import { useTheme } from '@/hooks/useTheme';
import { playSendSound, playReceiveSound, playClickSound } from '@/lib/sounds';
import { toast } from 'sonner';

interface ChatInterfaceProps {
  userName: string;
  onLogout: () => void;
}

const ChatInterface = ({ userName, onLogout }: ChatInterfaceProps) => {
  const { sessions, activeSession, activeId, setActiveId, createSession, deleteSession, updateMessages } = useChatSessions(userName);
  const { theme, toggle: toggleTheme } = useTheme();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // For streaming typewriter: store partial content separately
  const [streamingContent, setStreamingContent] = useState('');
  const [streamingId, setStreamingId] = useState<string | null>(null);

  const messages = activeSession?.messages || [];

  // Find latest code block
  const latestCode = useMemo(() => {
    const allMsgs = streamingId ? [...messages, { id: streamingId, role: 'assistant' as const, content: streamingContent }] : messages;
    for (let i = allMsgs.length - 1; i >= 0; i--) {
      const match = allMsgs[i].content.match(/```(\w*)\n?([\s\S]*?)```/);
      if (match) return { language: match[1] || 'html', code: match[2] };
    }
    return null;
  }, [messages, streamingContent, streamingId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, streamingContent]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isTyping || !activeSession) return;
    playSendSound();
    const userMsg = { id: Date.now().toString(), role: 'user' as const, content: input.trim() };
    const updatedMessages = [...messages, userMsg];
    updateMessages(activeId, updatedMessages);
    setInput('');
    setIsTyping(true);

    const apiMessages: ChatMsg[] = updatedMessages.map(m => ({ role: m.role, content: m.content }));
    const assistantId = (Date.now() + 1).toString();
    let fullContent = '';
    
    setStreamingId(assistantId);
    setStreamingContent('');

    await streamChat({
      messages: apiMessages,
      onDelta: (chunk) => {
        fullContent += chunk;
        setStreamingContent(fullContent);
      },
      onDone: () => {
        // Commit final message
        updateMessages(activeId, [...updatedMessages, { id: assistantId, role: 'assistant' as const, content: fullContent }]);
        setStreamingId(null);
        setStreamingContent('');
        setIsTyping(false);
        playReceiveSound();
      },
      onError: (error) => {
        setStreamingId(null);
        setStreamingContent('');
        setIsTyping(false);
        toast.error(error);
      },
    });
  }, [input, isTyping, activeSession, messages, activeId, updateMessages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const showDesktopSplit = !!latestCode;

  return (
    <div className="fixed inset-0 flex" style={{ background: theme === 'dark' ? 'hsl(240, 15%, 5%)' : 'hsl(0, 0%, 98%)' }}>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <ChatSidebar
          sessions={sessions}
          activeId={activeId}
          onSelect={setActiveId}
          onCreate={createSession}
          onDelete={deleteSession}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(c => !c)}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.div
              className="fixed top-0 right-0 z-50 h-full md:hidden"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <ChatSidebar
                sessions={sessions}
                activeId={activeId}
                onSelect={(id) => { setActiveId(id); setMobileSidebarOpen(false); }}
                onCreate={() => { createSession(); setMobileSidebarOpen(false); }}
                onDelete={deleteSession}
                collapsed={false}
                onToggle={() => setMobileSidebarOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <motion.header
          className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-glass-border/20 glass-card rounded-none"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3">
            <button onClick={() => { setMobileSidebarOpen(true); playClickSound(); }} className="p-2 rounded-xl text-muted-foreground hover:text-foreground transition-colors md:hidden">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-black gradient-text font-inter">NEXA</h1>
            <span className="text-[10px] text-muted-foreground/50 font-cairo hidden sm:inline">by Ahmed</span>
          </div>
          <div className="flex items-center gap-1.5">
            {latestCode && (
              <button
                onClick={() => { setMobilePreviewOpen(true); playClickSound(); }}
                className="flex md:hidden items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-inter glass-card-hover text-accent"
              >
                <FileCode className="w-4 h-4" />
              </button>
            )}
            <button onClick={() => { toggleTheme(); playClickSound(); }} className="p-2 rounded-xl text-muted-foreground hover:text-foreground transition-colors glass-card-hover" title="تبديل السمة">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={() => { playClickSound(); onLogout(); }} className="p-2 rounded-xl text-muted-foreground hover:text-destructive transition-colors glass-card-hover" title="تسجيل خروج">
              <LogOut className="w-4 h-4" />
            </button>
            <span className="text-sm text-muted-foreground font-cairo hidden sm:inline mr-2">
              {userName}
            </span>
          </div>
        </motion.header>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Desktop Code Preview */}
          <AnimatePresence>
            {showDesktopSplit && latestCode && (
              <motion.div
                className="hidden md:flex w-1/2 p-3"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: '50%', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="w-full h-full">
                  <CodePreview code={latestCode.code} language={latestCode.language} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chat panel */}
          <div className="flex flex-col flex-1">
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
              <div className={`mx-auto ${showDesktopSplit ? 'max-w-full' : 'max-w-2xl'}`}>
                {messages.map(msg => (
                  <ChatMessage key={msg.id} role={msg.role} content={msg.content} userName={userName} />
                ))}
                {/* Streaming message with typewriter */}
                {streamingId && streamingContent && (
                  <ChatMessage key={streamingId} role="assistant" content={streamingContent} userName={userName} isStreaming />
                )}
                {isTyping && !streamingContent && (
                  <div className="flex justify-start mb-4">
                    <div className="glass-card px-4 py-2">
                      <div className="text-xs mb-1 text-muted-foreground font-inter">Nexa AI</div>
                      <TypingIndicator />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-glass-border/20">
              <div className={`mx-auto ${showDesktopSplit ? 'max-w-full' : 'max-w-2xl'}`}>
                <div className="glass-card flex items-end gap-2 p-2 gradient-border">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="اكتب رسالتك هنا..."
                    dir="auto"
                    rows={1}
                    className="flex-1 bg-transparent border-0 resize-none px-3 py-2.5 text-foreground placeholder:text-muted-foreground/50 font-cairo focus:outline-none text-sm md:text-base max-h-32"
                    style={{ minHeight: '40px' }}
                  />
                  <motion.button
                    onClick={handleSend}
                    disabled={!input.trim() || isTyping}
                    className="btn-neon p-2.5 rounded-xl disabled:opacity-30"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Send className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile fullscreen preview */}
      <AnimatePresence>
        {mobilePreviewOpen && latestCode && (
          <motion.div
            className="fixed inset-0 z-50 bg-background flex flex-col md:hidden"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <CodePreview code={latestCode.code} language={latestCode.language} onClose={() => setMobilePreviewOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatInterface;
