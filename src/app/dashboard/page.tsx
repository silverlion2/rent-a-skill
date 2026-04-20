'use client';

import Link from 'next/link';
import { useState } from 'react';
import styles from './page.module.css';

export default function ExpertDashboard() {
  const [apiKey, setApiKey] = useState('sk_live_51Mxb...');
  const [copyText, setCopyText] = useState('Copy');

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopyText('Copied!');
    setTimeout(() => setCopyText('Copy'), 2000);
  };

  const handleRegenerate = () => {
    const newKey = 'sk_live_' + Math.random().toString(36).substr(2, 9) + '...';
    setApiKey(newKey);
  };

  return (
    <div className={styles.dashboardLayout}>
      <header className={styles.header}>
        <div className="container">
          <div className={styles.headerContent}>
            <div>
              <h1>Expert <span className="gradient-text">Dashboard</span></h1>
              <p>Manage your Skills, track API usage, and handle payouts.</p>
            </div>
            <Link href="/" className="btn-secondary">Back to Home</Link>
          </div>
        </div>
      </header>

      <section className="container">
        <div className={styles.statsGrid}>
          <div className="glass-card">
            <h4>Total API Calls (30d)</h4>
            <div className={styles.statValue}>12,408</div>
            <div className={styles.statTrend}>+14% from last month</div>
          </div>
          <div className="glass-card">
            <h4>Active Subscribers</h4>
            <div className={styles.statValue}>84</div>
            <div className={styles.statTrend}>+5 this week</div>
          </div>
          <div className="glass-card">
            <h4>Estimated Payout</h4>
            <div className={styles.statValue}>$3,420.50</div>
            <div className={styles.statTrend}>Processing in 4 days</div>
          </div>
        </div>

        <div className={styles.dashboardGrid}>
          
          {/* Main Content Area */}
          <div className={styles.mainPanel}>
            <div className={styles.panelHeader}>
              <h2>Your Hosted Skills</h2>
              <button className="btn-primary">+ Create New Skill</button>
            </div>

            <div className={`glass-card ${styles.skillRow}`}>
              <div className={styles.skillRowLeft}>
                <div className={styles.skillIcon}>📊</div>
                <div>
                  <h3>McKinsey PPT Engine</h3>
                  <div className={styles.statusBadge}>Online - MCP Active</div>
                </div>
              </div>
              <div className={styles.skillRowRight}>
                <button className="btn-secondary">Edit Prompt</button>
                <button className="btn-secondary">View Logs</button>
              </div>
            </div>

            <div className={`glass-card ${styles.skillRow}`}>
              <div className={styles.skillRowLeft}>
                <div className={styles.skillIcon} style={{ background: 'rgba(192, 132, 252, 0.2)', color: '#c084fc'}}>💊</div>
                <div>
                  <h3>Pharma Market Access (China)</h3>
                  <div className={styles.statusBadge}>Online - Chat & API</div>
                </div>
              </div>
              <div className={styles.skillRowRight}>
                <button className="btn-secondary">Update RAG</button>
                <button className="btn-secondary">View Logs</button>
              </div>
            </div>
          </div>

          {/* Sidebar Tools */}
          <div className={styles.sidePanel}>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3>API Keys</h3>
              <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
                Use these keys to register your local MCP servers with our proxy.
              </p>
              <div className={styles.apiBox} style={{ marginBottom: '1rem' }}>
                <code>{apiKey}</code>
                <button className={styles.copyBtn} onClick={handleCopy}>{copyText}</button>
              </div>
              <button 
                className="btn-secondary" 
                style={{ width: '100%', fontSize: '0.85rem' }}
                onClick={handleRegenerate}
              >
                Regenerate Key
              </button>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '2rem' }}>
              <h3>Quick Actions</h3>
              <ul className={styles.actionList}>
                <li>⚙️ Account Settings</li>
                <li>💳 Payout Details (Stripe)</li>
                <li>📚 Developer Documentation</li>
              </ul>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
