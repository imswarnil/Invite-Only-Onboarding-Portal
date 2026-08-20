import { Link } from 'react-router-dom'
import './Home.css'

const steps = [
  {
    step: '01',
    title: 'Apply',
    body: "A person applies, mirroring Stripe India's real invite-only onboarding form.",
  },
  {
    step: '02',
    title: 'Research & score',
    body: 'n8n scrapes the web; Salesforce AI (Prompt Builder + Agentforce) reasons over what it’s given and writes a fit score.',
  },
  {
    step: '03',
    title: 'Review',
    body: 'A human reviewer decides on the native Salesforce record page — AI recommends, it never auto-decides.',
  },
  {
    step: '04',
    title: 'Onboard & grow',
    body: 'Approved businesses are provisioned, then tracked for health — cancellation risk vs. upsell signal.',
  },
]

const progress: { status: 'done' | 'building' | 'planned'; label: string }[] = [
  { status: 'done', label: 'Object model + record types + page layouts (Invite_Request__c and friends)' },
  { status: 'done', label: 'Public intake: Experience Cloud Guest site + the Apply For Invite screen flow' },
  { status: 'done', label: 'React front end — this homepage, the /app dashboard demo, and the /learn site' },
  { status: 'building', label: 'Prompt Builder scoring + Agentforce review assistant' },
  { status: 'building', label: 'n8n crawler → CrawlSummary → Salesforce' },
  { status: 'planned', label: 'Data Cloud health tracking (cancel-risk vs. upsell segments)' },
]

const statusLabel: Record<string, string> = {
  done: '✓ Built',
  building: '◐ In progress',
  planned: '○ Planned',
}

const stack = ['React 19', 'Vite', 'TypeScript', 'Salesforce', 'Prompt Builder', 'Agentforce', 'Data Cloud', 'n8n', 'GitHub Pages']

function Home() {
  return (
    <>
      <header className="home-header">
        <div className="home-container home-header-row">
          <span className="home-brand">
            <span className="home-brand-mark" aria-hidden="true" />
            Invite Only Portal
          </span>
          <nav>
            <a href="#how-it-works">How it works</a>
            <a href="#progress">Progress</a>
            <Link to="/learn">Learn</Link>
            <Link to="/app">Live demo</Link>
            <a href="https://github.com/imswarnil/Invite-Only-Onboarding-Portal" target="_blank" rel="noreferrer">
              GitHub
            </a>
          </nav>
        </div>
      </header>

      <main>
        <section className="home-hero">
          <div className="home-container">
            <p className="home-eyebrow">⚛️ React · ☁️ Salesforce · 🕸️ n8n — a learning project</p>
            <h1>Invite Only Onboarding Portal</h1>
            <p className="home-hero-sub">
              A hands-on build of Stripe India&rsquo;s invite-only onboarding flow: Salesforce AI (Prompt
              Builder, Flow, Agentforce, Data Cloud) reasons over data an n8n crawler hands it, a React
              front end serves the public side, and every phase is written up as I go.
            </p>
            <div className="home-hero-actions">
              <Link className="home-btn home-btn-primary" to="/learn">
                Start the walkthrough →
              </Link>
              <Link className="home-btn home-btn-ghost" to="/app">
                See the live demo
              </Link>
            </div>
            <p className="home-hero-tag">Hello World — I&rsquo;m learning React in Salesforce.</p>
          </div>
        </section>

        <section id="how-it-works" className="home-section">
          <div className="home-container">
            <h2 className="home-section-title">How it works</h2>
            <div className="home-grid home-grid-4">
              {steps.map((s) => (
                <div className="home-card" key={s.step}>
                  <span className="home-card-step">{s.step}</span>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="progress" className="home-section home-section-soft">
          <div className="home-container">
            <h2 className="home-section-title">What&rsquo;s built so far</h2>
            <ul className="home-progress-list">
              {progress.map((p) => (
                <li key={p.label}>
                  <span className={`home-status home-status-${p.status}`}>{statusLabel[p.status]}</span>
                  <span>{p.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="home-section">
          <div className="home-container home-follow">
            <div>
              <h2 className="home-section-title home-section-title-left">Follow along</h2>
              <p className="home-follow-sub">
                Every phase — the data-model gotchas, the Guest User security model, the
                React↔Salesforce boundary — is written up in order, the way I actually hit each problem.
              </p>
            </div>
            <Link to="/learn" className="home-btn home-btn-primary">
              Read the build log →
            </Link>
          </div>
        </section>

        <section className="home-section home-section-soft">
          <div className="home-container">
            <h2 className="home-section-title">Built with</h2>
            <ul className="home-stack-list">
              {stack.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <div className="home-container home-footer-row">
          <div className="home-footer-links">
            <a href="https://github.com/imswarnil/Invite-Only-Onboarding-Portal" target="_blank" rel="noreferrer">
              GitHub
            </a>
            <Link to="/learn">Learn</Link>
            <Link to="/app">Live demo</Link>
          </div>
          <p>
            Independent educational project — not affiliated with, endorsed by, or connected to Stripe.
          </p>
        </div>
      </footer>
    </>
  )
}

export default Home
