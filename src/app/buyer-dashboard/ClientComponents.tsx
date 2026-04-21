'use client';

import { useState } from 'react';
import { generateApiKey, submitReview } from '../dashboard/actions';
import styles from '../dashboard/page.module.css';

export function BuyerDashboardActions() {
  const [apiKey, setApiKey] = useState('********* (Hidden)');
  const [copyText, setCopyText] = useState('Copy');

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

  return (
    <div className={styles.sidePanel}>
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3>Your API Key</h3>
        <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
          Use this key to authorize requests to <code>/api/query</code> and consume your rented skills.
          <br/><br/>
          <strong>Note: Generating a new key invalidates the old one.</strong>
        </p>
        <div className={styles.apiBox} style={{ marginBottom: '1rem', wordBreak: 'break-all' }}>
          <code>{apiKey}</code>
          <button className={styles.copyBtn} onClick={handleCopy}>{copyText}</button>
        </div>
        <button 
          className="btn-secondary" 
          style={{ width: '100%', fontSize: '0.85rem' }}
          onClick={handleRegenerate}
        >
          Generate New Key
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '2rem' }}>
        <h3>Quick Links</h3>
        <ul className={styles.actionList}>
          <li>⚙️ Account Settings</li>
          <li>💳 Payment Methods</li>
          <li>📚 Interop Documentation</li>
        </ul>
      </div>
    </div>
  );
}

export function ReviewSkillButton({ skillId }: { skillId: string }) {
  const [showModal, setShowModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitReview(skillId, rating, comment);
      setShowModal(false);
    } catch(err) {
      alert("Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button className="btn-secondary" onClick={() => setShowModal(true)}>Rate</button>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card" style={{ padding: '2rem', maxWidth: '400px', width: '100%' }}>
            <h2>Rate this Skill</h2>
            <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
              <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem', cursor: 'pointer' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span 
                    key={star} 
                    onClick={() => setRating(star)}
                    style={{ color: star <= rating ? '#fbbf24' : 'rgba(255,255,255,0.2)' }}
                  >
                    ★
                  </span>
                ))}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <textarea 
                  value={comment} 
                  onChange={(e) => setComment(e.target.value)} 
                  placeholder="Optional review..." 
                  rows={3} 
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
