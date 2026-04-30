import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from './supabase';
import { useNavigate } from 'react-router-dom';

export default function Lobby() {
  const [isJoining, setIsJoining] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // If no name, go back to identity
    if (!localStorage.getItem('vowlink_name')) {
      navigate('/');
    }
  }, [navigate]);

  const handleCreateSession = async () => {
    setIsLoading(true);
    setError('');
    try {
      const generatedPin = Math.floor(100000 + Math.random() * 900000).toString();
      const hostName = localStorage.getItem('vowlink_name') || 'Host';

      const { error: dbError } = await supabase
        .from('sessions')
        .insert([{ pin_code: generatedPin, host_name: hostName, status: 'waiting' }]);

      if (dbError) throw dbError;

      navigate(`/chat/${generatedPin}`);
    } catch (err: any) {
      console.error(err);
      setError('Failed to create session. Check Supabase connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 6) {
      setError('PIN must be 6 digits');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const guestName = localStorage.getItem('vowlink_name') || 'Guest';

      const { data: session, error: fetchError } = await supabase
        .from('sessions')
        .select('*')
        .eq('pin_code', pin)
        .single();

      if (fetchError || !session) {
        throw new Error('Session not found or PIN incorrect.');
      }

      if (session.status !== 'waiting') {
        throw new Error('Session is already active or closed.');
      }

      const { error: updateError } = await supabase
        .from('sessions')
        .update({ guest_name: guestName, status: 'active' })
        .eq('id', session.id);

      if (updateError) throw updateError;

      navigate(`/chat/${pin}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to join session');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-sm mx-auto flex flex-col justify-center flex-1 p-4 gap-6"
    >
      <h2 className="text-lg text-center mb-2 tracking-tight">VowLink Lobby</h2>
      
      {error && <div className="text-red-500 text-sm text-center">{error}</div>}

      {!isJoining ? (
        <>
          <button 
            onClick={handleCreateSession}
            disabled={isLoading}
            className="w-full p-4 border-0.5 border-borderGray flex justify-center items-center hover:bg-vowlinkGray transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Creating...' : 'Create Session'}
          </button>
          <div className="text-center text-sm opacity-50 font-mono">or</div>
          <button 
            onClick={() => setIsJoining(true)}
            className="w-full p-4 border-0.5 border-borderGray flex justify-center hover:bg-vowlinkGray transition-colors"
          >
            Join Session
          </button>
        </>
      ) : (
        <form onSubmit={handleJoinSession} className="flex flex-col gap-4">
          <label className="text-sm opacity-70">Enter 6-Digit PIN</label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            className="w-full p-4 border-0.5 border-borderGray bg-transparent text-center text-2xl tracking-[0.5em] outline-none focus:border-textMain"
            placeholder="000000"
            autoFocus
          />
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={() => setIsJoining(false)}
              className="flex-1 p-3 border-0.5 border-borderGray hover:bg-vowlinkGray transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={pin.length !== 6 || isLoading}
              className="flex-1 p-3 bg-textMain text-background disabled:opacity-50"
            >
              {isLoading ? 'Joining...' : 'Join'}
            </button>
          </div>
        </form>
      )}
    </motion.div>
  );
}
