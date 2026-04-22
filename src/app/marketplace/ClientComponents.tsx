'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set('q', query);
    } else {
      params.delete('q');
    }
    router.push(`/marketplace?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
      <input 
        type="text" 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for skills, namespaces, or experts..." 
        style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
      />
      <button type="submit" className="btn-primary">Search</button>
    </form>
  );
}
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
