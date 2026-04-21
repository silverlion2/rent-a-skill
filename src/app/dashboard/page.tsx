import Link from 'next/link';
import styles from './page.module.css';
import { createClient } from '@/utils/supabase/server';
import { DashboardActions, CreateSkillButton } from './ClientComponents';

export default async function ExpertDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Should be caught by middleware, but fallback
    return <div>Unauthorized</div>;
  }

  // Fetch Skills
  const { data: skills } = await supabase.from('skills').select('*').eq('expert_id', user.id).order('created_at', { ascending: false });

  // Fetch Subscriber count for these skills 
  // (In a real app, we'd do a count query on subscriptions where skill_id IN our skills)
  const { data: subscriptions } = await supabase.from('subscriptions').select('id, status');

  // Fetch API call count
  const { count: apiCallCount } = await supabase
    .from('execution_logs')
    .select('*', { count: 'exact', head: true })
    .eq('expert_id', user.id);

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
            <h4>Total Executions</h4>
            <div className={styles.statValue}>{apiCallCount || 0}</div>
            <div className={styles.statTrend}>Lifetime API calls</div>
          </div>
          <div className="glass-card">
            <h4>Active Subscribers</h4>
            <div className={styles.statValue}>{subscriptions?.length || 0}</div>
            <div className={styles.statTrend}>0 this week</div>
          </div>
          <div className="glass-card">
            <h4>Estimated Payout</h4>
            <div className={styles.statValue}>$0.00</div>
            <div className={styles.statTrend}>Processing in 4 days</div>
          </div>
        </div>

        <div className={styles.dashboardGrid}>
          
          {/* Main Content Area */}
          <div className={styles.mainPanel}>
            <div className={styles.panelHeader}>
              <h2>Your Hosted Skills</h2>
              <CreateSkillButton />
            </div>

            {skills && skills.length > 0 ? (
              skills.map((skill) => (
                <div key={skill.id} className={`glass-card ${styles.skillRow}`}>
                  <div className={styles.skillRowLeft}>
                    <div className={styles.skillIcon} style={ skill.type === 'chat' ? { background: 'rgba(192, 132, 252, 0.2)', color: '#c084fc'} : {}}>
                      {skill.type === 'chat' ? '💬' : skill.type === 'mcp' ? '🔌' : '⚡'}
                    </div>
                    <div>
                      <h3>{skill.title}</h3>
                      <div className={styles.statusBadge}>
                        {skill.is_published ? 'Online' : 'Offline'} - {skill.type.toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <div className={styles.skillRowRight}>
                    <button className="btn-secondary">Edit</button>
                    <button className="btn-secondary">Logs</button>
                  </div>
                </div>
              ))
            ) : (
                <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', opacity: 0.7 }}>
                  <p>You haven't created any skills yet.</p>
                </div>
            )}
          </div>

          {/* Sidebar Tools and Modals injected via Client Component */}
          <DashboardActions />

        </div>
      </section>
    </div>
  );
}
