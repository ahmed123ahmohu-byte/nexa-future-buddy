import { motion } from 'framer-motion';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  userName?: string;
}

const ChatMessage = ({ role, content, userName }: ChatMessageProps) => {
  const isUser = role === 'user';

  // Parse code blocks
  const renderContent = () => {
    const parts = content.split(/(```[\s\S]*?```)/g);
    return parts.map((part, i) => {
      const codeMatch = part.match(/```(\w*)\n?([\s\S]*?)```/);
      if (codeMatch) {
        return (
          <div key={i} className="my-3 rounded-xl overflow-hidden bg-background/60 border border-glass-border/20">
            <div className="flex items-center justify-between px-3 py-1.5 bg-secondary/40 text-xs text-muted-foreground font-inter">
              <span>{codeMatch[1] || 'code'}</span>
            </div>
            <pre className="p-4 overflow-x-auto text-sm font-mono text-accent leading-relaxed">
              <code>{codeMatch[2]}</code>
            </pre>
          </div>
        );
      }
      return part ? (
        <span key={i} className="whitespace-pre-wrap leading-relaxed">
          {part}
        </span>
      ) : null;
    });
  };

  return (
    <motion.div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className={`max-w-[85%] md:max-w-[70%] ${
          isUser
            ? 'btn-neon rounded-2xl rounded-br-md px-5 py-3 text-primary-foreground'
            : 'glass-card px-5 py-3 text-foreground'
        }`}
      >
        <div className="text-xs mb-1 opacity-60 font-inter">
          {isUser ? (userName || 'You') : 'Nexa AI'}
        </div>
        <div className="text-sm md:text-base font-cairo" dir="auto">
          {renderContent()}
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;
