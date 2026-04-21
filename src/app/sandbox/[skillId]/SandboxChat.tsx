'use client';

import { useState } from 'react';
import { runSandboxQuery } from './actions';
import styles from '../../dashboard/page.module.css';

export function SandboxChat({ skillId, skillType }: { skillId: string, skillType: string }) {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage = input;
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      // If it's pure MCP we might pass the raw string as payload, if chat just query
      const payload = skillType === 'mcp' ? { query: userMessage, mcp_mode: true } : undefined;
      const response = await runSandboxQuery(skillId, userMessage, payload);
      
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `[Error]: ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Messages Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', opacity: 0.5, marginTop: '20%' }}>
            <p>Send a message to start executing this tool.</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} style={{ 
              display: 'flex', 
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: '1rem' 
            }}>
              <div style={{
                maxWidth: '75%',
                padding: '1rem',
                borderRadius: '0.75rem',
                background: msg.role === 'user' ? '#a855f7' : 'rgba(255,255,255,0.05)',
                color: msg.role === 'user' ? 'white' : '#e2e8f0',
                border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                whiteSpace: 'pre-wrap'
              }}>
                {msg.content}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '1rem' }}>
             <div style={{ padding: '1rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
               Executing...
             </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={skillType === 'mcp' ? 'Pass JSON or query to endpoint...' : 'Chat with context...'}
            style={{ 
              flex: 1, 
              padding: '1rem', 
              borderRadius: '0.5rem', 
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'transparent',
              color: 'white',
              outline: 'none'
            }} 
          />
          <button 
            className="btn-primary" 
            onClick={handleSend}
            disabled={loading || !input.trim()}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
