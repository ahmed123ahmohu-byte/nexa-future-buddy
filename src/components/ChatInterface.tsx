import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Trash2, Code, MessageSquare } from 'lucide-react';
import ChatMessage from '@/components/ChatMessage';
import TypingIndicator from '@/components/TypingIndicator';
import CodePreview from '@/components/CodePreview';
import { streamChat, type ChatMessage as ChatMsg } from '@/lib/streamChat';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatInterfaceProps {
  userName: string;
}

const ChatInterface = ({ userName }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('nexa-chat');
    if (saved) return JSON.parse(saved);
    return [{
      id: '1',
      role: 'assistant' as const,
      content: `أهلاً يا ${userName} 👋\nمستعد نبدأ ونبني المستقبل؟ 🚀\n\nأنا نيكسا — مساعدك الذكي للبرمجة والتطوير. اكتب أي شيء وسأساعدك!`,
    }];
  });
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [mobileTab, setMobileTab] = useState<'chat' | 'preview'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Find latest code block
  const latestCode = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const match = messages[i].content.match(/```(\w*)\n?([\s\S]*?)```/);
      if (match) return { language: match[1] || 'html', code: match[2] };
    }
    return null;
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('nexa-chat', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsTyping(true);

    // Build history for API (exclude IDs)
    const apiMessages: ChatMsg[] = updatedMessages.map(m => ({ role: m.role, content: m.content }));

    let assistantContent = "";
    const assistantId = (Date.now() + 1).toString();

    await streamChat({
      messages: apiMessages,
      onDelta: (chunk) => {
        assistantContent += chunk;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === 'assistant' && last.id === assistantId) {
            return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantContent } : m);
          }
          return [...prev, { id: assistantId, role: 'assistant', content: assistantContent }];
        });
      },
      onDone: () => {
        setIsTyping(false);
        // Auto switch to preview on mobile if code
        if (assistantContent.includes('```')) setMobileTab('preview');
      },
      onError: (error) => {
        setIsTyping(false);
        toast.error(error);
      },
    });
  };

  const handleClear = () => {
    setMessages([{
      id: Date.now().toString(),
      role: 'assistant',
      content: `تم مسح المحادثة! 🧹\nكيف يمكنني مساعدتك يا ${userName}؟`,
    }]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const showSplit = !!latestCode;

  return (
    <div className="fixed inset-0 flex flex-col" style={{ background: 'hsl(240 15% 5%)' }}>
      {/* Header */}
      <motion.header
        className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-glass-border/20 glass-card rounded-none"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-black gradient-text font-inter">NEXA</h1>
          <span className="text-xs text-muted-foreground font-cairo">AI Assistant</span>
        </div>
        <div className="flex items-center gap-2">
          {showSplit && (
            <div className="flex md:hidden glass-card rounded-xl p-1 gap-1">
              <button
                onClick={() => setMobileTab('chat')}
                className={`px-3 py-1.5 rounded-lg text-xs font-inter transition-all ${mobileTab === 'chat' ? 'bg-primary/20 text-accent' : 'text-muted-foreground'}`}
              >
                <MessageSquare className="w-4 h-4" />
              </button>
              <button
                onClick={() => setMobileTab('preview')}
                className={`px-3 py-1.5 rounded-lg text-xs font-inter transition-all ${mobileTab === 'preview' ? 'bg-primary/20 text-accent' : 'text-muted-foreground'}`}
              >
                <Code className="w-4 h-4" />
              </button>
            </div>
          )}
          <button
            onClick={handleClear}
            className="p-2 rounded-xl text-muted-foreground hover:text-destructive transition-colors glass-card-hover"
            title="مسح المحادثة"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <span className="text-sm text-muted-foreground font-cairo hidden sm:inline">
            مرحباً، {userName}
          </span>
        </div>
      </motion.header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Code Preview */}
        <AnimatePresence>
          {showSplit && latestCode && (
            <motion.div
              className={`${mobileTab === 'preview' ? 'flex' : 'hidden'} md:flex w-full md:w-1/2 p-3`}
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
        <div
          className={`${showSplit && mobileTab === 'preview' ? 'hidden md:flex' : 'flex'} flex-col flex-1 ${showSplit ? 'md:w-1/2' : 'w-full'}`}
        >
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
            <div className={`mx-auto ${showSplit ? 'max-w-full' : 'max-w-2xl'}`}>
              {messages.map(msg => (
                <ChatMessage key={msg.id} role={msg.role} content={msg.content} userName={userName} />
              ))}
              {isTyping && messages[messages.length - 1]?.role !== 'assistant' && (
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
            <div className={`mx-auto ${showSplit ? 'max-w-full' : 'max-w-2xl'}`}>
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
  );
};

export default ChatInterface;
