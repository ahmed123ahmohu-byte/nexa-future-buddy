import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Trash2, Code, MessageSquare } from 'lucide-react';
import ChatMessage from '@/components/ChatMessage';
import TypingIndicator from '@/components/TypingIndicator';
import CodePreview from '@/components/CodePreview';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatInterfaceProps {
  userName: string;
}

// Simulated AI responses
const getAIResponse = (input: string): string => {
  const lower = input.toLowerCase();
  if (lower.includes('html') || lower.includes('صفحة') || lower.includes('موقع')) {
    return `بالتأكيد! إليك صفحة HTML بسيطة وجميلة:\n\n\`\`\`html\n<!DOCTYPE html>\n<html lang="ar" dir="rtl">\n<head>\n  <meta charset="UTF-8">\n  <style>\n    body {\n      font-family: 'Cairo', sans-serif;\n      background: linear-gradient(135deg, #0f0f1a, #1a1030);\n      color: #e2e8f0;\n      display: flex;\n      justify-content: center;\n      align-items: center;\n      min-height: 100vh;\n      margin: 0;\n    }\n    .card {\n      background: rgba(255,255,255,0.05);\n      backdrop-filter: blur(20px);\n      border: 1px solid rgba(139,92,246,0.3);\n      border-radius: 20px;\n      padding: 40px;\n      text-align: center;\n      box-shadow: 0 0 40px rgba(139,92,246,0.1);\n    }\n    h1 { color: #a78bfa; margin-bottom: 16px; }\n    p { color: #94a3b8; line-height: 1.8; }\n  </style>\n</head>\n<body>\n  <div class="card">\n    <h1>مرحباً بالعالم! 🌍</h1>\n    <p>هذه صفحة مصممة بواسطة Nexa AI</p>\n  </div>\n</body>\n</html>\n\`\`\`\n\nيمكنك مشاهدة المعاينة المباشرة في اللوحة الجانبية! ✨`;
  }
  if (lower.includes('javascript') || lower.includes('js') || lower.includes('كود')) {
    return `إليك مثال JavaScript ممتع:\n\n\`\`\`javascript\nconst greet = (name) => {\n  console.log(\`مرحباً يا \${name}! 👋\`);\n  console.log('Nexa AI يرحب بك');\n};\n\ngreet('Developer');\n\n// Fibonacci\nconst fib = (n) => n <= 1 ? n : fib(n-1) + fib(n-2);\nconsole.log('Fibonacci(10):', fib(10));\n\`\`\`\n\nكود نظيف وسريع! 🚀`;
  }
  if (lower.includes('css') || lower.includes('تصميم') || lower.includes('ستايل')) {
    return `إليك بعض CSS الرائع:\n\n\`\`\`css\n.nexa-button {\n  background: linear-gradient(135deg, #8b5cf6, #06b6d4);\n  color: white;\n  padding: 12px 32px;\n  border: none;\n  border-radius: 16px;\n  font-size: 16px;\n  cursor: pointer;\n  transition: all 0.3s ease;\n  box-shadow: 0 0 20px rgba(139,92,246,0.3);\n}\n\n.nexa-button:hover {\n  transform: translateY(-3px);\n  box-shadow: 0 0 40px rgba(139,92,246,0.5);\n}\n\`\`\`\n\nتصميم مستقبلي أنيق! 💎`;
  }
  if (lower.includes('مرحب') || lower.includes('هلا') || lower.includes('سلام') || lower.includes('hi') || lower.includes('hello')) {
    return `أهلاً وسهلاً! 😊\n\nأنا نيكسا، مساعدك الذكي. يمكنني مساعدتك في:\n\n• كتابة وتنفيذ الأكواد (HTML, CSS, JS)\n• شرح المفاهيم البرمجية\n• تصميم واجهات المستخدم\n• حل المشاكل التقنية\n\nماذا تريد أن نبني اليوم؟ 🚀`;
  }
  return `شكراً على سؤالك! 💡\n\nأنا نيكسا، وأنا هنا لمساعدتك. جرّب أن تطلب مني:\n\n• "اكتب صفحة HTML"\n• "اكتب كود JavaScript"\n• "اكتب CSS جميل"\n\nأو أي سؤال برمجي آخر! 🔥`;
};

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
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));

    const aiResponse = getAIResponse(input);
    const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: aiResponse };
    setMessages(prev => [...prev, aiMsg]);
    setIsTyping(false);

    // Auto switch to preview on mobile if code
    if (aiResponse.includes('```')) setMobileTab('preview');
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
          {/* Mobile tab toggle */}
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
        {/* Code Preview — Desktop left panel */}
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
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
            <div className={`mx-auto ${showSplit ? 'max-w-full' : 'max-w-2xl'}`}>
              {messages.map(msg => (
                <ChatMessage key={msg.id} role={msg.role} content={msg.content} userName={userName} />
              ))}
              {isTyping && (
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
