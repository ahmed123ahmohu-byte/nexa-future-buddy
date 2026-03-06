import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import type { ChatSession } from '@/hooks/useChatSessions';
import { playClickSound, playNewChatSound, playDeleteSound } from '@/lib/sounds';

interface ChatSidebarProps {
  sessions: ChatSession[];
  activeId: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  collapsed: boolean;
  onToggle: () => void;
}

const ChatSidebar = ({ sessions, activeId, onSelect, onCreate, onDelete, collapsed, onToggle }: ChatSidebarProps) => {
  return (
    <div className="relative flex h-full">
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.aside
            className="h-full border-l border-glass-border/20 bg-card/80 backdrop-blur-xl flex flex-col overflow-hidden"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 272, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="flex items-center justify-between p-4 border-b border-glass-border/20 min-w-[272px]">
              <h2 className="text-sm font-semibold font-cairo text-foreground">المحادثات</h2>
              <button
                onClick={() => { onCreate(); playNewChatSound(); }}
                className="p-2 rounded-xl text-accent hover:bg-accent/10 transition-colors"
                title="محادثة جديدة"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1 min-w-[272px]">
              {sessions.map(session => (
                <motion.button
                  key={session.id}
                  onClick={() => { onSelect(session.id); playClickSound(); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-right transition-all group
                    ${session.id === activeId ? 'bg-primary/15 text-accent border border-primary/20' : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'}`}
                  layout
                >
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  <span className="flex-1 text-xs font-cairo truncate">{session.title}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(session.id); playDeleteSound(); }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-destructive/20 hover:text-destructive transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </motion.button>
              ))}
            </div>

            {/* Credit */}
            <div className="p-3 border-t border-glass-border/20 text-center min-w-[272px]">
              <p className="text-[10px] text-muted-foreground/60 font-cairo">
                صنع بواسطة <span className="text-accent font-semibold">أحمد الرئيس</span> 🚀
              </p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Toggle arrow */}
      <button
        onClick={() => { onToggle(); playClickSound(); }}
        className="absolute top-1/2 -translate-y-1/2 -left-4 z-10 w-8 h-8 rounded-full glass-card flex items-center justify-center text-muted-foreground hover:text-accent hover:border-accent/30 transition-all shadow-lg"
        title={collapsed ? 'فتح المحادثات' : 'إغلاق المحادثات'}
      >
        {collapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
    </div>
  );
};

export default ChatSidebar;
