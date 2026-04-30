import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function ChatDummy() {
  const { pin } = useParams<{ pin: string }>();
  const navigate = useNavigate();

  const handleEndSession = () => {
    localStorage.removeItem('vowlink_name');
    navigate('/');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 flex flex-col p-4 w-full max-w-md mx-auto"
    >
      <div className="text-center mb-6 opacity-50 text-sm">
        Session PIN: {pin}
      </div>
      <div className="flex-1 border-0.5 border-borderGray p-4 flex items-center justify-center text-center opacity-50 mb-4">
        Chat View Implementation Pending...
      </div>
      <button 
        onClick={handleEndSession}
        className="p-3 border-0.5 border-borderGray hover:bg-vowlinkGray transition-colors w-full"
      >
        End Session
      </button>
    </motion.div>
  );
}
