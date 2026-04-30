import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, MessageSquare } from 'lucide-react';

function App() {
  const [step, setStep] = useState<'login' | 'lobby' | 'chat'>('login');

  return (
    <div className="flex-1 flex flex-col h-full bg-background font-mono text-textMain">
      <header className="flex-none p-4 border-b-0.5 border-borderGray">
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <MessageSquare size={20} />
          VowLink
        </h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center">
        {step === 'login' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm"
          >
            <h2 className="text-lg mb-6">Identify Yourself</h2>
            <div className="flex flex-col gap-4">
              <input 
                type="text" 
                placeholder="Display Name" 
                className="w-full p-3 border-0.5 border-borderGray bg-white outline-none focus:border-textMain transition-colors"
              />
              <button 
                onClick={() => setStep('lobby')}
                className="w-full bg-textMain text-white p-3 flex justify-between items-center"
              >
                Continue <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 'lobby' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm flex flex-col gap-6"
          >
            <button 
              onClick={() => setStep('chat')}
              className="w-full p-4 border-0.5 border-borderGray flex justify-center hover:bg-vowlinkGray transition-colors"
            >
              Create Session
            </button>
            <div className="text-center text-sm opacity-50">or</div>
            <button 
              onClick={() => setStep('chat')}
              className="w-full p-4 border-0.5 border-borderGray flex justify-center hover:bg-vowlinkGray transition-colors"
            >
              Join Session
            </button>
          </motion.div>
        )}

        {step === 'chat' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full h-full flex flex-col"
          >
            <div className="flex-1 flex flex-col gap-4 overflow-y-auto pb-4">
              {/* Partner */}
              <div className="self-start w-3/4 pl-3 border-l-0.5 border-borderGray">
                <div className="text-xs opacity-40 mb-1">Partner</div>
                <div>We need to talk about the budget.</div>
              </div>

              {/* VowLink / Gemini */}
              <div className="self-center w-5/6 bg-vowlinkGray p-3 text-sm my-4 rounded-sm">
                <p>I hear financial stress. Let's break this down objectively. What specific aspect of the budget is causing concern?</p>
              </div>

              {/* Me */}
              <div className="self-end w-3/4 pr-3 border-r-0.5 border-borderGray text-right">
                <div className="text-xs opacity-40 mb-1">Me</div>
                <div>I just feel like we're overspending on dining out.</div>
              </div>
            </div>

            <div className="mt-auto border-t-0.5 border-borderGray pt-3 pb-safe">
              <div className="flex">
                <input 
                  type="text" 
                  placeholder="Message..." 
                  className="flex-1 p-2 outline-none bg-transparent"
                />
                <button className="p-2 text-textMain">Send</button>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

export default App;
