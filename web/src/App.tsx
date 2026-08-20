import './App.css'

// Pulled from the org via:
//   sf data query --query "SELECT Id, First_Name__c, Last_Name__c, Work_Email__c,
//     Applicant_Type__c, Country__c, Stage__c, Fit_Score__c, LastModifiedDate
//     FROM Invite_Request__c ORDER BY LastModifiedDate DESC" --target-org iop-dev
// Snapshot taken 2026-08-20 — a point-in-time pull, not a live fetch. A live version
// would need a proxy per instruction.md's React↔Salesforce boundary (react.md §3):
// the browser never calls the Salesforce API directly.
const inviteRequests = [
  {
    name: 'Swarnil Singhai',
    email: 'contact@imswarnil.com',
    type: 'Individual',
    country: 'India',
    stage: 'Received',
    score: null as number | null,
    lastModified: '2026-08-20T00:32:29.000+0000',
  },
  {
    name: 'Test User',
    email: 'admin@namastesalesforce.com',
    type: 'Individual',
    country: 'India',
    stage: 'Received',
    score: null as number | null,
    lastModified: '2026-08-19T23:58:26.000+0000',
  },
]

const kpis: { label: string; value: string; delta?: string; direction?: 'up' | 'down' }[] = [
  { label: 'Total invite requests', value: String(inviteRequests.length) },
  { label: 'Individual applicants', value: String(inviteRequests.filter((r) => r.type === 'Individual').length) },
  { label: 'Company applicants', value: String(inviteRequests.filter((r) => r.type === 'Company').length) },
  {
    label: 'Avg fit score',
    value: inviteRequests.some((r) => r.score !== null)
      ? String(
          Math.round(
            inviteRequests.reduce((sum, r) => sum + (r.score ?? 0), 0) /
              inviteRequests.filter((r) => r.score !== null).length,
          ),
        )
      : 'Not yet scored',
  },
]

const stageOrder = [
  'Received',
  'AI Validation',
  'Action Needed',
  'In Review',
  'Approved',
  'Onboarding',
  'Activated',
  'Won',
  'Waitlisted',
  'Rejected',
]

const stages = stageOrder.map((name) => ({
  name,
  count: inviteRequests.filter((r) => r.stage === name).length,
}))

const quickActions = ['Run Research', 'Send Fix Request', 'Approve & Provision', 'Create Upsell', 'Assign TSE']

const stageTheme: Record<string, string> = {
  Won: 'slds-theme_success',
  Activated: 'slds-theme_success',
  Approved: 'slds-theme_success',
  Onboarding: 'slds-theme_success',
  'Action Needed': 'slds-theme_warning',
  Waitlisted: 'slds-theme_warning',
  Rejected: 'slds-theme_error',
}

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
        <div className="slds-page-header">
          <div className="slds-page-header__row">
            <div className="slds-page-header__col-title">
              <div className="slds-media">
                <div className="slds-media__figure">
                  <span className="app-object-icon" aria-hidden="true">
                    IO
                  </span>
                </div>
                <div className="slds-media__body">
                  <div className="slds-page-header__name">
                    <div className="slds-page-header__name-title">
                      <h1 className="slds-page-header__title slds-truncate">
                        <span>Invite Only Onboarding</span>
                      </h1>
                    </div>
                  </div>
                  <p className="slds-page-header__name-meta">Home</p>
                </div>
              </div>
            </div>
            <div className="slds-page-header__col-actions">
              <div className="slds-page-header__controls">
                <div className="slds-page-header__control topbar-right">
                  <span className="slds-badge" title="Snapshot pulled via sf data query, not a live fetch">
                    Data as of Aug 20
                  </span>
                  <span className="avatar">RS</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <main className="app-content slds-p-around_medium">
          <div className="slds-tabs_default">
            <ul className="slds-tabs_default__nav" role="tablist">
              <li className="slds-tabs_default__item slds-is-active" role="presentation">
                <a className="slds-tabs_default__link" href="#" role="tab">
                  Recent
                </a>
              </li>
              <li className="slds-tabs_default__item" role="presentation">
                <a className="slds-tabs_default__link" href="#" role="tab">
                  All Invite Requests
                </a>
              </li>
            </ul>
          </div>

          <section className="slds-grid slds-wrap slds-gutters slds-m-top_medium">
            {kpis.map((k) => (
              <div className="slds-col slds-size_1-of-2 slds-large-size_1-of-4" key={k.label}>
                <div className="slds-box slds-box_x-small stat-tile">
                  <p className="stat-label">{k.label}</p>
                  <p className="stat-value">{k.value}</p>
                  {k.delta && (
                    <p className={`stat-delta stat-delta-${k.direction}`}>
                      <span aria-hidden="true">{k.direction === 'up' ? '↑' : '↓'}</span> {k.delta}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </section>

          <section className="slds-grid slds-wrap slds-gutters slds-m-top_medium">
            <div className="slds-col slds-size_1-of-1 slds-large-size_2-of-3">
              <article className="slds-card">
                <div className="slds-card__header slds-grid">
                  <header className="slds-media slds-media_center slds-has-flexi-truncate">
                    <div className="slds-media__body">
                      <h2 className="slds-card__header-title">Requests by stage</h2>
                    </div>
                  </header>
                </div>
                <div className="slds-card__body slds-card__body_inner">
                  <div className="funnel">
                    {stages.map((s) => (
                      <div className="funnel-row" key={s.name}>
                        <span className="funnel-label">{s.name}</span>
                        <div className="funnel-track">
                          <div
                            className="funnel-bar"
                            style={{ width: `${(s.count / maxStageCount) * 100}%` }}
                          />
                        </div>
                        <span className="funnel-value">{s.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            </div>

            <div className="slds-col slds-size_1-of-1 slds-large-size_1-of-3">
              <article className="slds-card">
                <div className="slds-card__header slds-grid">
                  <header className="slds-media slds-media_center slds-has-flexi-truncate">
                    <div className="slds-media__body">
                      <h2 className="slds-card__header-title">Quick actions</h2>
                    </div>
                  </header>
                </div>
                <div className="slds-card__body slds-card__body_inner">
                  <ul className="action-list">
                    {quickActions.map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                </div>
              </article>
            </div>
          </section>

          <article className="slds-card slds-m-top_medium">
            <div className="slds-card__header slds-grid">
              <header className="slds-media slds-media_center slds-has-flexi-truncate">
                <div className="slds-media__body">
                  <h2 className="slds-card__header-title">Invite Requests</h2>
                </div>
              </header>
            </div>
            <div className="slds-card__body">
              <table className="slds-table slds-table_bordered slds-table_cell-buffer slds-table_striped">
                <thead>
                  <tr className="slds-line-height_reset">
                    <th scope="col">
                      <div className="slds-truncate">Name</div>
                    </th>
                    <th scope="col">
                      <div className="slds-truncate">Work Email</div>
                    </th>
                    <th scope="col">
                      <div className="slds-truncate">Applicant Type</div>
                    </th>
                    <th scope="col">
                      <div className="slds-truncate">Country</div>
                    </th>
                    <th scope="col">
                      <div className="slds-truncate">Stage</div>
                    </th>
                    <th scope="col">
                      <div className="slds-truncate">Fit Score</div>
                    </th>
                    <th scope="col">
                      <div className="slds-truncate">Last Modified</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {inviteRequests.map((r) => (
                    <tr key={r.email}>
                      <th scope="row">
                        <div className="slds-truncate">{r.name}</div>
                      </th>
                      <td>
                        <div className="slds-truncate">{r.email}</div>
                      </td>
                      <td>
                        <div className="slds-truncate">{r.type}</div>
                      </td>
                      <td>
                        <div className="slds-truncate">{r.country}</div>
                      </td>
                      <td>
                        <span className={`slds-badge ${stageTheme[r.stage] ?? ''}`}>{r.stage}</span>
                      </td>
                      <td className="num">
                        <div className="slds-truncate">{r.score ?? '—'}</div>
                      </td>
                      <td>
                        <div className="slds-truncate">
                          {new Date(r.lastModified).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

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
