'use client';

import Link from 'next/link';
import { useState } from 'react';
import styles from './page.module.css';

export default function Marketplace() {
  const [subscribedSkills, setSubscribedSkills] = useState<Record<number, boolean>>({});
  const [loadingSkill, setLoadingSkill] = useState<number | null>(null);

  const handleSubscribe = async (id: number) => {
    setLoadingSkill(id);
    // Mocking an external Stripe Checkout delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSubscribedSkills(prev => ({ ...prev, [id]: true }));
    setLoadingSkill(null);
  };

  const skills = [
    {
      id: 1,
      expert: 'MBB_Expert',
      initials: 'MB',
      color: '#3b82f6',
      title: 'McKinsey PPT Engine',
      description: 'Auto-generate McKinsey-style 10-slide strategy decks with perfect alignment and dynamic layout logic. Guaranteed zero-defect slide generation.',
      category: 'Consulting',
      type: 'MCP Tool',
      price: '$0.05 / call'
    },
    {
      id: 2,
      expert: 'Regulatory_Pro',
      initials: 'PR',
      color: '#c084fc',
      title: 'Pharma Market Access (China)',
      description: 'Interact with a fine-tuned RAG system containing the latest NRDL negotiations, OBA strategies, and Hui Min Bao data.',
      category: 'Healthcare',
      type: 'Chat + API',
      price: '$99 / mo'
    },
    {
      id: 3,
      expert: 'Quant_Trader_X',
      initials: 'QT',
      color: '#10b981',
      title: 'Monte Carlo Options Modeler',
      description: 'Pass in a ticker and strike data, get back a complete Monte Carlo simulated risk profile for options strategies via structured JSON.',
      category: 'Finance',
      type: 'MCP Tool',
      price: '$0.15 / call'
    },
    {
      id: 4,
      expert: 'DesignSystem_AI',
      initials: 'DS',
      color: '#f59e0b',
      title: 'Glassmorphism UX Reviewer',
      description: 'Upload your React components, and get back fully tailored Glassmorphic CSS/Tailwind overrides.',
      category: 'Design',
      type: 'Chat',
      price: '$29 / mo'
    }
  ];

  return (
    <div className={styles.marketplaceLayout}>
      <header className={styles.header}>
        <div className="container">
          <div className={styles.headerContent}>
            <div>
              <h1>Explore <span className="gradient-text">Skills</span></h1>
              <p>Discover expert-created AI tools, APIs, and Custom Contexts.</p>
            </div>
            <Link href="/" className="btn-secondary">Back to Home</Link>
          </div>
        </div>
      </header>

      <section className={`container ${styles.mainSection}`}>
        {/* Sidebar Filters */}
        <aside className={`glass-panel ${styles.sidebar}`}>
          <h3>Categories</h3>
          <ul className={styles.filterList}>
            <li className={styles.activeFilter}>All Skills</li>
            <li>Consulting</li>
            <li>Finance</li>
            <li>Healthcare</li>
            <li>Design</li>
          </ul>

          <h3 className={styles.filterMargin}>Type</h3>
          <ul className={styles.filterList}>
            <li>All Types</li>
            <li>MCP Tools</li>
            <li>Chat Contexts</li>
          </ul>
        </aside>

        {/* Grid */}
        <div className={styles.grid}>
          {skills.map(skill => (
            <div key={skill.id} className={`glass-card ${styles.skillCard}`}>
              <div className={styles.cardTop}>
                <div className={styles.badge}>{skill.category}</div>
                <div className={styles.typeBadge}>{skill.type}</div>
              </div>
              
              <div className={styles.authorRow}>
                <div className={styles.avatar} style={{ backgroundColor: skill.color }}>
                  {skill.initials}
                </div>
                <span className={styles.authorName}>@{skill.expert}</span>
              </div>
              
              <h3 className={styles.skillTitle}>{skill.title}</h3>
              <p className={styles.skillDesc}>{skill.description}</p>
              
              <div className={styles.cardFooter}>
                <div className={styles.price}>{skill.price}</div>
                {subscribedSkills[skill.id] ? (
                  <button className="btn-secondary" style={{ color: '#4ade80', borderColor: '#4ade80' }} disabled>
                    Subscribed ✓
                  </button>
                ) : (
                  <button 
                    className="btn-primary" 
                    onClick={() => handleSubscribe(skill.id)}
                    disabled={loadingSkill === skill.id}
                  >
                    {loadingSkill === skill.id ? 'Processing...' : 'Subscribe'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
