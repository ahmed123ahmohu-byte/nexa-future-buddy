import { motion } from 'framer-motion';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  userName?: string;
  isStreaming?: boolean;
}

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="p-1.5 rounded-lg hover:bg-accent/10 text-muted-foreground hover:text-accent transition-colors" title="نسخ الكود">
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
};

const ChatMessage = ({ role, content, userName, isStreaming }: ChatMessageProps) => {
  const isUser = role === 'user';

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
          <ReactMarkdown
            components={{
              code({ className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                const codeStr = String(children).replace(/\n$/, '');
                const isInline = !match && !codeStr.includes('\n');
                
                if (isInline) {
                  return <code className="px-1.5 py-0.5 rounded-md bg-secondary text-accent text-sm font-mono" {...props}>{children}</code>;
                }

                return (
                  <div className="my-3 rounded-xl overflow-hidden bg-background/60 border border-glass-border/20">
                    <div className="flex items-center justify-between px-3 py-1.5 bg-secondary/40 text-xs text-muted-foreground font-inter">
                      <span>{match?.[1] || 'code'}</span>
                      <CopyButton text={codeStr} />
                    </div>
                    <pre className="p-4 overflow-x-auto text-sm font-mono text-accent leading-relaxed">
                      <code>{codeStr}</code>
                    </pre>
                  </div>
                );
              },
              p({ children }) {
                return <p className="mb-2 last:mb-0 leading-relaxed whitespace-pre-wrap">{children}</p>;
              },
              ul({ children }) {
                return <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>;
              },
              ol({ children }) {
                return <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>;
              },
              strong({ children }) {
                return <strong className="font-bold text-accent">{children}</strong>;
              },
              h1({ children }) { return <h1 className="text-xl font-bold mb-2 text-accent">{children}</h1>; },
              h2({ children }) { return <h2 className="text-lg font-bold mb-2 text-accent">{children}</h2>; },
              h3({ children }) { return <h3 className="text-base font-bold mb-1 text-accent">{children}</h3>; },
            }}
          >
            {content}
          </ReactMarkdown>
          {/* Blinking cursor for streaming */}
          {isStreaming && (
            <span className="inline-block w-2 h-4 bg-accent animate-pulse ml-0.5 align-middle rounded-sm" />
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;
