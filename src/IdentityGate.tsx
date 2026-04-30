import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function IdentityGate() {
  const [name, setName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('vowlink_name');
    if (stored) {
      navigate('/lobby', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      localStorage.setItem('vowlink_name', name.trim());
      navigate('/lobby');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-sm mx-auto flex flex-col items-center justify-center flex-1 p-4"
    >
      <h2 className="text-lg mb-6 self-start tracking-tight">Identify Yourself</h2>
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
        <input 
          type="text" 
          placeholder="Display Name" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 border-0.5 border-borderGray bg-transparent outline-none focus:border-textMain transition-colors"
        />
        <button 
          type="submit"
          disabled={!name.trim()}
          className="w-full bg-textMain text-background p-3 flex justify-between items-center disabled:opacity-50"
        >
          Continue <ArrowRight size={18} />
        </button>
      </form>
    </motion.div>
  );
}
