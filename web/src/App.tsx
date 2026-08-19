import './App.css'

const kpis: { label: string; value: string; delta?: string; direction?: 'up' | 'down' }[] = [
  { label: 'Total invite requests', value: '128', delta: '+8 this week', direction: 'up' },
  { label: 'Pending review', value: '24' },
  { label: 'Approved this month', value: '41', delta: '+6 vs last month', direction: 'up' },
  { label: 'Active accounts', value: '97' },
]

const stages = [
  { name: 'Received', count: 128 },
  { name: 'AI Validation', count: 96 },
  { name: 'Action Needed', count: 40 },
  { name: 'In Review', count: 58 },
  { name: 'Approved', count: 41 },
  { name: 'Onboarding', count: 33 },
  { name: 'Activated', count: 29 },
  { name: 'Won', count: 21 },
]

const quickActions = ['Run Research', 'Send Fix Request', 'Approve & Provision', 'Create Upsell', 'Assign TSE']

const recentActivity = [
  { applicant: 'Aarav Mehta', stage: 'In Review', score: 78, updated: '2h ago' },
  { applicant: 'Priya Nair Textiles', stage: 'AI Validation', score: 61, updated: '4h ago' },
  { applicant: 'Kunal Traders', stage: 'Approved', score: 84, updated: '1d ago' },
  { applicant: 'Meera Exports', stage: 'Action Needed', score: 45, updated: '1d ago' },
  { applicant: 'Rohan D.', stage: 'Received', score: 52, updated: '2d ago' },
]

const navItems = ['Dashboard', 'Invite Requests', 'Accounts', 'Reports', 'Settings']

const maxStageCount = Math.max(...stages.map((s) => s.count))

function App() {
  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="app-brand">
          <span className="brand-mark" aria-hidden="true" />
          Invite Only Portal
        </div>
        <nav className="app-nav">
          {navItems.map((item, i) => (
            <a key={item} className={i === 0 ? 'active' : undefined} href="#">
              {item}
            </a>
          ))}
        </nav>
        <p className="app-sidebar-footer">Hello World — I&rsquo;m learning React in Salesforce.</p>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <h1>Dashboard</h1>
          <div className="topbar-right">
            <span className="badge">Demo data</span>
            <span className="avatar">RS</span>
          </div>
        </header>

        <main className="app-content">
          <section className="kpi-row">
            {kpis.map((k) => (
              <div className="stat-tile" key={k.label}>
                <p className="stat-label">{k.label}</p>
                <p className="stat-value">{k.value}</p>
                {k.delta && (
                  <p className={`stat-delta stat-delta-${k.direction}`}>
                    <span aria-hidden="true">{k.direction === 'up' ? '↑' : '↓'}</span> {k.delta}
                  </p>
                )}
              </div>
            ))}
          </section>

          <section className="app-grid-2col">
            <div className="panel">
              <h2>Requests by stage</h2>
              <div className="funnel">
                {stages.map((s, i) => (
                  <div className="funnel-row" key={s.name}>
                    <span className="funnel-label">{s.name}</span>
                    <div className="funnel-track">
                      <div
                        className="funnel-bar"
                        style={{
                          width: `${(s.count / maxStageCount) * 100}%`,
                          background: `var(--stage-${i + 1})`,
                        }}
                      />
                    </div>
                    <span className="funnel-value">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel">
              <h2>Quick actions</h2>
              <ul className="action-list">
                {quickActions.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>
          </section>

          <section className="panel">
            <h2>Recent activity</h2>
            <table className="activity-table">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Stage</th>
                  <th>Fit score</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((r) => (
                  <tr key={r.applicant}>
                    <td>{r.applicant}</td>
                    <td>
                      <span className="pill">{r.stage}</span>
                    </td>
                    <td className="num">{r.score}</td>
                    <td>{r.updated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <p className="app-disclaimer">
            Independent educational project — not affiliated with, endorsed by, or connected to
            Stripe.
          </p>
        </main>
      </div>
    </div>
  )
}

export default App
