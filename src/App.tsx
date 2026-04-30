import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import IdentityGate from './IdentityGate';
import Lobby from './Lobby';
import ChatDummy from './ChatDummy';

function App() {
  return (
    <Router>
      <div className="flex flex-col h-full bg-background font-mono text-textMain antialiased">
        <header className="flex-none p-4 border-b-0.5 border-borderGray">
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2 max-w-md mx-auto w-full">
            <MessageSquare size={20} />
            VowLink
          </h1>
        </header>

        <main className="flex-1 overflow-y-auto flex flex-col w-full">
          <Routes>
            <Route path="/" element={<IdentityGate />} />
            <Route path="/lobby" element={<Lobby />} />
            <Route path="/chat/:pin" element={<ChatDummy />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
