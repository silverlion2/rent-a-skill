import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import styles from './page.module.css';
import { SubscribeButton } from './ClientComponents';

export default async function Marketplace() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch all published skills from the metrics view
  const { data: skills } = await supabase
    .from('skill_metrics')
    .select('*')
    .eq('is_published', true)
    .order('avg_rating', { ascending: false })
    .order('review_count', { ascending: false });

  // Fetch current user's subscriptions
  let userSubscriptions = new Set<string>();
  if (user) {
    const { data: subs } = await supabase
      .from('subscriptions')
      .select('skill_id')
      .eq('buyer_id', user.id)
      .eq('status', 'active');
    
    if (subs) {
      subs.forEach(s => userSubscriptions.add(s.skill_id));
    }
  }

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
          {skills && skills.map(skill => (
            <div key={skill.skill_id} className={`glass-card ${styles.skillCard}`}>
              <div className={styles.cardTop}>
                <div className={styles.badge}>{skill.category || 'General'}</div>
                <div className={styles.typeBadge}>{skill.type.toUpperCase()}</div>
              </div>
              
              <div className={styles.authorRow}>
                <div className={styles.avatar} style={{ backgroundColor: '#3b82f6' }}>
                  {skill.expert_name?.charAt(0) || '?'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span className={styles.authorName}>@{skill.expert_name || 'Anonymous Expert'}</span>
                  {skill.namespace && <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{skill.namespace}</span>}
                </div>
              </div>
              
              <h3 className={styles.skillTitle}>{skill.title}</h3>
              <p className={styles.skillDesc}>{skill.description}</p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#94a3b8' }}>
                <span style={{ color: '#fbbf24' }}>★ {Number(skill.avg_rating).toFixed(1)}</span>
                <span>({skill.review_count})</span>
                <span style={{ margin: '0 0.5rem' }}>•</span>
                <span>{skill.active_subscribers} active</span>
              </div>
              
              <div className={styles.cardFooter}>
                <div className={styles.price}>${skill.monthly_price} / mo</div>
                {user ? (
                  <SubscribeButton skillId={skill.skill_id} isSubscribed={userSubscriptions.has(skill.skill_id)} />
                ) : (
                  <Link href="/login" className="btn-secondary">Log in to Subscribe</Link>
                )}
              </div>
            </div>
          ))}

          {(!skills || skills.length === 0) && (
            <div className="glass-card" style={{ padding: '3rem', gridColumn: '1 / -1', textAlign: 'center', opacity: 0.8 }}>
              No skills published yet. Be the first to share your expertise!
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
