import './App.css'

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

const features = [
  {
    title: 'AI that reasons, not guesses',
    body: 'Prompt Builder and Agentforce ground every score in data they are given — they never invent facts or fetch the web themselves.',
  },
  {
    title: 'Native reviewer experience',
    body: 'Page layouts, Dynamic Forms, and an Agentforce panel — the reviewer never leaves Salesforce.',
  },
  {
    title: 'One React app, three surfaces',
    body: 'This homepage, the invite form, and the applicant portal are a single React app that talks to Salesforce over the wire, not by rendering it.',
  },
]

const stack = ['React 19', 'Vite', 'Salesforce', 'Prompt Builder', 'Agentforce', 'Data Cloud', 'n8n']

function App() {
  return (
    <>
      <header className="site-header">
        <div className="container header-row">
          <span className="brand">
            <span className="brand-mark" aria-hidden="true" />
            Invite Only Portal
          </span>
          <nav>
            <a href="#how-it-works">How it works</a>
            <a href="#features">Features</a>
            <a href="#stack">Tech stack</a>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="container">
            <p className="eyebrow">⚛️ React · ☁️ Salesforce · Learning project</p>
            <h1>Invite-only onboarding, reviewed by AI and humans together.</h1>
            <p className="hero-sub">
              A hands-on learning project pairing a full React front end with Salesforce&rsquo;s
              AI stack — Prompt Builder, Flow, Agentforce, and Data Cloud — to research, score,
              and onboard applicants the way Stripe India&rsquo;s invite program might.
            </p>
            <div className="hero-actions">
              <a className="btn btn-primary" href="#how-it-works">
                See how it works
              </a>
              <a className="btn btn-ghost" href="#stack">
                View the tech stack
              </a>
            </div>
            <p className="hero-tag">Hello World — I&rsquo;m learning React in Salesforce.</p>
          </div>
        </section>

        <section id="how-it-works" className="section">
          <div className="container">
            <h2 className="section-title">How it works</h2>
            <div className="grid grid-4">
              {steps.map((s) => (
                <div className="card" key={s.step}>
                  <span className="card-step">{s.step}</span>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="section section-soft">
          <div className="container">
            <h2 className="section-title">Why it&rsquo;s built this way</h2>
            <div className="grid grid-3">
              {features.map((f) => (
                <div className="card" key={f.title}>
                  <h3>{f.title}</h3>
                  <p>{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="stack" className="section">
          <div className="container">
            <h2 className="section-title">Built with</h2>
            <ul className="stack-list">
              {stack.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container">
          <p>
            Independent educational project — not affiliated with, endorsed by, or connected to
            Stripe.
          </p>
        </div>
      </footer>
    </>
  )
}

export default App
