import { motion } from 'framer-motion';

const TypingIndicator = () => (
  <motion.div
    className="flex items-center gap-1.5 px-4 py-3"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    <div className="typing-dot" />
    <div className="typing-dot" />
    <div className="typing-dot" />
  </motion.div>
);

export default TypingIndicator;
