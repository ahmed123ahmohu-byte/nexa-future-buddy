import { useState } from 'react';
import { motion } from 'framer-motion';

interface LoginScreenProps {
  onLogin: (name: string) => void;
}

const LoginScreen = ({ onLogin }: LoginScreenProps) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      localStorage.setItem('nexa-user', name.trim());
      onLogin(name.trim());
    }
  };

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center px-6"
      style={{
        background: 'radial-gradient(ellipse at 50% 40%, hsl(270 50% 10%), hsl(240 20% 4%) 80%)',
      }}
      initial={{ opacity: 0, filter: 'blur(10px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      transition={{ duration: 0.8 }}
    >
      <motion.div
        className="glass-card p-8 md:p-12 w-full max-w-md gradient-border"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black gradient-text font-inter mb-3">NEXA</h2>
          <p className="text-muted-foreground font-cairo text-lg" dir="rtl">
            أدخل اسمك للبدء
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="اكتب اسمك"
              className="w-full px-5 py-4 rounded-2xl bg-input/50 border border-glass-border/40 text-foreground placeholder:text-muted-foreground/60 font-cairo text-lg focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all backdrop-blur-sm"
              autoFocus
            />
          </div>

          <motion.button
            type="submit"
            className="btn-neon w-full text-lg font-cairo"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={!name.trim()}
            style={{ opacity: name.trim() ? 1 : 0.5 }}
          >
            دخول ✨
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default LoginScreen;
