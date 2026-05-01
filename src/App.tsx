import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import IdentityGate from './IdentityGate';
import Lobby from './Lobby';
import ChatRoom from './ChatRoom';

function App() {
  return (
    <Router>
      <div className="flex flex-col h-full bg-background font-mono text-textMain antialiased">
        <header className="flex-none p-4 border-b-0.5 border-borderGray hidden">
          {/* Main heading is hidden in the app layout because Lobby/Identity Gate have their own minimal headers, and ChatRoom has its own header.*/}
        </header>

        <main className="flex-1 overflow-y-auto flex flex-col w-full h-full">
          <Routes>
            <Route path="/" element={<IdentityGate />} />
            <Route path="/lobby" element={<Lobby />} />
            <Route path="/chat/:pin" element={<ChatRoom />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
