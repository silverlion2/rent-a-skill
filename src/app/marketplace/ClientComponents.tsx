'use client';

import { useState } from 'react';

export function SubscribeButton({ skillId, isSubscribed }: { skillId: string, isSubscribed: boolean }) {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      // Direct user to Stripe checkout
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ skillId })
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Checkout failed: ' + data.error);
      }
    } catch (error) {
      console.error(error);
      alert('Network error');
    } finally {
      setLoading(false);
    }
  };

  if (isSubscribed) {
    return (
      <button className="btn-secondary" style={{ color: '#4ade80', borderColor: '#4ade80' }} disabled>
        Subscribed ✓
      </button>
    );
  }

  return (
    <button 
      className="btn-primary" 
      onClick={handleSubscribe}
      disabled={loading}
    >
      {loading ? 'Redirecting...' : 'Subscribe'}
    </button>
  );
}
