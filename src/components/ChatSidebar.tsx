import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, MessageSquare, X } from 'lucide-react';
import type { ChatSession } from '@/hooks/useChatSessions';

interface ChatSidebarProps {
  sessions: ChatSession[];
  activeId: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  open: boolean;
  onClose: () => void;
}

const ChatSidebar = ({ sessions, activeId, onSelect, onCreate, onDelete, open, onClose }: ChatSidebarProps) => {
  return (
    <>
      {/* Overlay for mobile */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={`fixed md:relative z-50 top-0 right-0 h-full w-72 border-l border-glass-border/20 bg-card/80 backdrop-blur-xl flex flex-col
          ${open ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
          md:translate-x-0 transition-transform duration-300`}
      >
        <div className="flex items-center justify-between p-4 border-b border-glass-border/20">
          <h2 className="text-sm font-semibold font-cairo text-foreground">المحادثات</h2>
          <div className="flex gap-2">
            <button onClick={onCreate} className="p-2 rounded-xl text-accent hover:bg-accent/10 transition-colors" title="محادثة جديدة">
              <Plus className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-2 rounded-xl text-muted-foreground hover:text-foreground transition-colors md:hidden">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessions.map(session => (
            <motion.button
              key={session.id}
              onClick={() => { onSelect(session.id); onClose(); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-right transition-all group
                ${session.id === activeId ? 'bg-primary/15 text-accent border border-primary/20' : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'}`}
              layout
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-xs font-cairo truncate">{session.title}</span>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(session.id); }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-destructive/20 hover:text-destructive transition-all"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </motion.button>
          ))}
        </div>
      </motion.aside>
    </>
  );
};

export default ChatSidebar;
