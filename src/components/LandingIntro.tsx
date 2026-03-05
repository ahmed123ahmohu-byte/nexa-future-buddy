import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ParticleField from '@/components/ParticleField';

interface LandingIntroProps {
  onComplete: () => void;
}

const LandingIntro = ({ onComplete }: LandingIntroProps) => {
  const [showButton, setShowButton] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowButton(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleStart = () => {
    setExiting(true);
    setTimeout(onComplete, 800);
  };

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
          style={{
            background: 'radial-gradient(ellipse at 50% 30%, hsl(270 60% 12%), hsl(240 20% 4%) 70%)',
          }}
          exit={{ opacity: 0, filter: 'blur(20px)' }}
          transition={{ duration: 0.8 }}
        >
          <ParticleField />

          <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center">
            {/* Glowing orb */}
            <motion.div
              className="absolute -top-32 w-64 h-64 rounded-full opacity-30"
              style={{
                background: 'radial-gradient(circle, hsl(195 100% 55% / 0.4), transparent 70%)',
              }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 4, repeat: Infinity }}
            />

            {/* Logo */}
            <motion.h1
              className="text-6xl md:text-8xl font-black tracking-tight gradient-text font-inter"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              NEXA
            </motion.h1>

            {/* Arabic text */}
            <motion.p
              className="text-xl md:text-2xl font-cairo neon-text text-foreground/90 max-w-lg leading-relaxed"
              dir="rtl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1 }}
            >
              نيكسا ليس مجرد عميل… بل هو المستقبل.
            </motion.p>

            <motion.p
              className="text-base md:text-lg font-cairo text-muted-foreground max-w-md"
              dir="rtl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.8 }}
            >
              مصنوع بأيادٍ طلاب عرب. 🌍
            </motion.p>

            {/* CTA Button */}
            <AnimatePresence>
              {showButton && (
                <motion.button
                  className="btn-neon mt-6 text-lg font-cairo neon-glow"
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.6, type: 'spring' }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleStart}
                >
                  🚀 ابدأ الآن
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LandingIntro;
