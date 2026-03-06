import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import LandingIntro from '@/components/LandingIntro';
import LoginScreen from '@/components/LoginScreen';
import ChatInterface from '@/components/ChatInterface';

type AppState = 'intro' | 'login' | 'chat';

const Index = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('nexa-user');
    return saved ? 'chat' : 'intro';
  });
  const [userName, setUserName] = useState(() => localStorage.getItem('nexa-user') || '');

  useEffect(() => {
    document.body.style.background = 'hsl(240, 15%, 5%)';
  }, []);

  const handleIntroComplete = () => setState('login');

  const handleLogin = (name: string) => {
    setUserName(name);
    setState('chat');
  };

  const handleLogout = () => {
    localStorage.removeItem('nexa-user');
    localStorage.removeItem('nexa-sessions');
    localStorage.removeItem('nexa-chat');
    setUserName('');
    setState('intro');
  };

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {state === 'intro' && <LandingIntro key="intro" onComplete={handleIntroComplete} />}
        {state === 'login' && <LoginScreen key="login" onLogin={handleLogin} />}
        {state === 'chat' && <ChatInterface key="chat" userName={userName} onLogout={handleLogout} />}
      </AnimatePresence>
    </div>
  );
};

export default Index;
