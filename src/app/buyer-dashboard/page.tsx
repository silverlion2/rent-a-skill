import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import styles from '../dashboard/page.module.css';
import { BuyerDashboardActions, ReviewSkillButton } from './ClientComponents';

export default async function BuyerDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div>Unauthorized</div>;
  }

  // Fetch Subscriptions joined with Skills
  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('id, status, created_at, skills(id, title, category, type)')
    .eq('buyer_id', user.id)
    .eq('status', 'active');

  return (
    <div className={styles.dashboardLayout}>
      <header className={styles.header}>
        <div className="container">
          <div className={styles.headerContent}>
            <div>
              <h1>Consumer <span className="gradient-text">Dashboard</span></h1>
              <p>Manage your active rentals and API keys.</p>
            </div>
            <Link href="/" className="btn-secondary">Back to Home</Link>
          </div>
        </div>
      </header>

      <section className="container">
        <div className={styles.dashboardGrid}>
          
          {/* Main Content Area */}
          <div className={styles.mainPanel}>
            <div className={styles.panelHeader}>
              <h2>Your Active Rentals</h2>
              <Link href="/marketplace" className="btn-primary">Browse Marketplace</Link>
            </div>

            {subscriptions && subscriptions.length > 0 ? (
              subscriptions.map((sub: any) => (
                <div key={sub.id} className={`glass-card ${styles.skillRow}`}>
                  <div className={styles.skillRowLeft}>
                    <div className={styles.skillIcon} style={ sub.skills.type === 'chat' ? { background: 'rgba(192, 132, 252, 0.2)', color: '#c084fc'} : {}}>
                      {sub.skills.type === 'chat' ? '💬' : sub.skills.type === 'mcp' ? '🔌' : '⚡'}
                    </div>
                    <div>
                      <h3>{sub.skills.title}</h3>
                      <div className={styles.statusBadge}>
                        Active - {sub.skills.type.toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <div className={styles.skillRowRight}>
                    <Link href={`/sandbox/${sub.skills.id}`} className="btn-secondary" style={{ marginRight: '0.5rem' }}>Open Sandbox</Link>
                    <ReviewSkillButton skillId={sub.skills.id} />
                    <button className="btn-secondary" style={{ color: '#ef4444', borderColor: '#ef4444', marginLeft: '0.5rem' }}>Cancel</button>
                  </div>
                </div>
              ))
            ) : (
                <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', opacity: 0.7 }}>
                  <p>You haven't rented any skills yet.</p>
                </div>
            )}
          </div>

          <BuyerDashboardActions />

        </div>
      </section>
    </div>
  );
}
