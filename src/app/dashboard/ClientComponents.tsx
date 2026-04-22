'use client';

import { useState } from 'react';
import { generateApiKey, createSkill, logout } from './actions';
import styles from './page.module.css';

export function DashboardActions() {
  const [apiKey, setApiKey] = useState('********************************');
  const [copyText, setCopyText] = useState('Copy');
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [skillType, setSkillType] = useState('both');

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopyText('Copied!');
    setTimeout(() => setCopyText('Copy'), 2000);
  };

  const handleRegenerate = async () => {
    setCopyText('Generating...');
    try {
      const newKey = await generateApiKey();
      setApiKey(newKey);
      setCopyText('Copy New Key');
    } catch (e) {
      setCopyText('Error');
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // Let Server Action handle the DB insert via form action natively or wrapping:
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await createSkill(formData);
    setShowSkillForm(false);
  };

  return (
    <>
      <div className={styles.sidePanel}>
        {/* API keys logic moved to buyer dashboard */}

        <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '2rem' }}>
          <h3>Quick Actions</h3>
          <ul className={styles.actionList}>
            <li>⚙️ Account Settings</li>
            <li>💳 Payout Details (Stripe)</li>
            <li>📚 Developer Documentation</li>
            <li onClick={() => logout()} style={{ color: '#ef4444', cursor: 'pointer', marginTop: '1rem' }}>🚪 Logout</li>
          </ul>
        </div>
      </div>

      {showSkillForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card" style={{ padding: '2rem', maxWidth: '500px', width: '100%' }}>
            <h2>Create New Skill</h2>
            <form onSubmit={handleCreateSubmit} style={{ marginTop: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Title</label>
                <input name="title" required style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Namespace (e.g. io.expert.rag)</label>
                <input name="namespace" required placeholder="io.github.yourname.skill" style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Category</label>
                <input name="category" defaultValue="Productivity" style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Monthly Price ($)</label>
                <input name="monthlyPrice" type="number" step="0.01" required style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Type</label>
                <select name="type" value={skillType} onChange={(e) => setSkillType(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
                  <option value="chat">Chat (LLM System Prompt)</option>
                  <option value="mcp">MCP Proxy Endpoint</option>
                  <option value="both">Both</option>
                </select>
              </div>

              {(skillType === 'chat' || skillType === 'both') && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>System Prompt (Hidden from Buyers)</label>
                  <textarea name="systemPrompt" rows={4} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}></textarea>
                </div>
              )}

              {(skillType === 'mcp' || skillType === 'both') && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>MCP Endpoint POST URL</label>
                  <input name="mcpUrl" type="url" placeholder="https://..." style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Deploy Skill</button>
                <button type="button" className="btn-secondary" onClick={() => setShowSkillForm(false)} style={{ flex: 1 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expose a button for parent component to trigger popup */}
      <span id="create-skill-portal" style={{ display: 'none' }} onClick={() => setShowSkillForm(true)}></span>
    </>
  );
}

// Simple wrapper for the create button on the server page
export function CreateSkillButton() {
  return (
    <button className="btn-primary" onClick={() => {
      document.getElementById('create-skill-portal')?.click();
    }}>+ Create New Skill</button>
  );
}
