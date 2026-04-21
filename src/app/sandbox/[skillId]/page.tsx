import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { SandboxChat } from './SandboxChat';
import styles from '../../dashboard/page.module.css';

export default async function SandboxPage({ params }: { params: { skillId: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <div>Unauthorized</div>;

  // Verify the user has access
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('*, skills(id, title, description, category, type)')
    .eq('skill_id', params.skillId)
    .eq('buyer_id', user.id)
    .single();

  if (!sub || sub.status !== 'active') {
    return (
      <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>You do not have an active subscription to this skill.</p>
        <Link href="/buyer-dashboard" className="btn-primary">Return to Dashboard</Link>
      </div>
    );
  }

  // Get a valid API key for this user so they can query it securely
  const { data: keyData } = await supabase
    .from('api_keys')
    .select('hashed_key') // We can't actually get the raw key back. 
    // Usually a sandbox doesn't use the external network, it calls a secure server action!
    .eq('buyer_id', user.id)
    .limit(1);

  return (
    <div className={styles.dashboardLayout}>
      <header className={styles.header}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1><span className="gradient-text">Sandbox:</span> {sub.skills.title}</h1>
            <p>{sub.skills.category} | {sub.skills.type.toUpperCase()} Mode</p>
          </div>
          <Link href="/buyer-dashboard" className="btn-secondary">Back to Dashboard</Link>
        </div>
      </header>

      <section className="container">
        <div className="glass-card" style={{ height: 'calc(100vh - 200px)', padding: 0, display: 'flex', flexDirection: 'column' }}>
          <SandboxChat skillId={params.skillId} skillType={sub.skills.type} />
        </div>
      </section>
    </div>
  );
}
