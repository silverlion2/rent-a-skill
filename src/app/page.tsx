import { Metadata } from 'next';
import styles from './page.module.css';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Rent-a-Skill | Knowledge-as-a-Service Portal',
  description: 'Access elite AI-powered skills and expertise through an exclusive rental marketplace.',
};

export default function Home() {
  return (
    <main className={styles.main}>
      <div className="container">
        
        {/* Navigation */}
        <nav className={styles.navbar}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>⚛</span>
            <span className="gradient-text">Rent-a-Skill</span>
          </div>
          <div className={styles.navLinks}>
            <Link href="/marketplace" className={styles.navLink}>Marketplace</Link>
            <Link href="/dashboard" className={styles.navLink}>Expert Dashboard</Link>
            <Link href="/login" className="btn-secondary">Sign In</Link>
          </div>
        </nav>

        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.pillBadge}>✨ Revolutionizing Knowledge Access</div>
            <h1>
              Rent world-class <br />
              <span className="gradient-text">AI Agents & Skills</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Instantly plug elite expertise directly into your workflows. Rent specialized 
              skills, context-aware AI models, and MCP tools built by top-tier professionals.
            </p>
            <div className={styles.ctaGroup}>
              <Link href="/marketplace" className="btn-primary">Explore Skills</Link>
              <Link href="/dashboard" className="btn-secondary">I'm an Expert</Link>
            </div>
          </div>
          
          <div className={styles.heroVisual}>
            <div className={`glass-panel ${styles.floatingCard} ${styles.card1}`}>
              <div className={styles.cardHeader}>
                <div className={styles.avatar}>MB</div>
                <div>
                  <h4>McKinsey PPT Engine</h4>
                  <span>@mbb_expert</span>
                </div>
              </div>
              <div className={styles.cardMetric}>
                <span>API Calls: 12.4k</span>
                <span className={styles.activePulse}>● Live MCP</span>
              </div>
            </div>

            <div className={`glass-panel ${styles.floatingCard} ${styles.card2}`}>
              <div className={styles.cardHeader}>
                <div className={styles.avatar} style={{background: '#c084fc'}}>PR</div>
                <div>
                  <h4>Pharma Market Access</h4>
                  <span>@regulatory_pro</span>
                </div>
              </div>
              <div className={styles.cardMetric}>
                <span>Subscription: $99/mo</span>
                <span className={styles.activePulse}>● Live Chat</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className={styles.features}>
          <h2 className={styles.sectionTitle}>Why Rent-a-Skill?</h2>
          <div className={styles.grid}>
            <div className="glass-card">
              <div className={styles.iconBox}>🔌</div>
              <h3>Plug & Play APIs</h3>
              <p>Execute specialized expert tools programmatically via standard MCP and REST endpoints.</p>
            </div>
            <div className="glass-card">
              <div className={styles.iconBox}>💬</div>
              <h3>Protected Chat</h3>
              <p>Communicate directly with the expert's contextualized RAG system in our secure sandbox.</p>
            </div>
            <div className="glass-card">
              <div className={styles.iconBox}>🛡️</div>
              <h3>IP Protection</h3>
              <p>Experts retain 100% control over their prompts and data through server-rendered execution.</p>
            </div>
          </div>
        </section>
        
      </div>
    </main>
  );
}
