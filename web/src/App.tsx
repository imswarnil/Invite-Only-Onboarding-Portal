import { useState } from 'react'
import './App.css'
import RecordModal, { type RecordFormValues } from './RecordModal'

interface InviteRequest {
  id: string
  firstName: string
  lastName: string
  email: string
  country: string
  type: 'Individual' | 'Company'
  stage: string
  score: number | null
  lastModified: string
}

// Pulled from the org via:
//   sf data query --query "SELECT Id, First_Name__c, Last_Name__c, Work_Email__c,
//     Applicant_Type__c, Country__c, Stage__c, Fit_Score__c, LastModifiedDate
//     FROM Invite_Request__c ORDER BY LastModifiedDate DESC" --target-org iop-dev
// Snapshot taken 2026-08-20 — a point-in-time pull, not a live fetch. Edits and new
// records made below only update this in-browser state; nothing writes back to
// Salesforce yet — that needs a proxy per the React↔Salesforce boundary in react.md §3.
const initialRequests: InviteRequest[] = [
  {
    id: 'a06g700000Grq97AAB',
    firstName: 'Swarnil',
    lastName: 'Singhai',
    email: 'contact@imswarnil.com',
    country: 'India',
    type: 'Individual',
    stage: 'Received',
    score: null,
    lastModified: '2026-08-20T00:32:29.000+0000',
  },
  {
    id: 'a06g700000GrckTAAR',
    firstName: 'Test',
    lastName: 'User',
    email: 'admin@namastesalesforce.com',
    country: 'India',
    type: 'Individual',
    stage: 'Received',
    score: null,
    lastModified: '2026-08-19T23:58:26.000+0000',
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

const stageTheme: Record<string, string> = {
  Won: 'slds-theme_success',
  Activated: 'slds-theme_success',
  Approved: 'slds-theme_success',
  Onboarding: 'slds-theme_success',
  'Action Needed': 'slds-theme_warning',
  Waitlisted: 'slds-theme_warning',
  Rejected: 'slds-theme_error',
}

const quickActions = ['Run Research', 'Send Fix Request', 'Approve & Provision', 'Create Upsell', 'Assign TSE']
const navItems = ['Dashboard', 'Invite Requests', 'Accounts', 'Reports', 'Settings']
const typeFilters = ['All', 'Individual', 'Company'] as const

const blankForm: RecordFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  country: 'India',
  type: 'Individual',
  stage: 'Received',
}

function App() {
  const [records, setRecords] = useState<InviteRequest[]>(initialRequests)
  const [typeFilter, setTypeFilter] = useState<(typeof typeFilters)[number]>('All')
  const [stageFilter, setStageFilter] = useState('All')
  const [modal, setModal] = useState<{ mode: 'create' | 'edit'; id: string | null } | null>(null)

  const filtered = records.filter(
    (r) => (typeFilter === 'All' || r.type === typeFilter) && (stageFilter === 'All' || r.stage === stageFilter),
  )

  const stages = stageOrder.map((name) => ({ name, count: records.filter((r) => r.stage === name).length }))
  const maxStageCount = Math.max(1, ...stages.map((s) => s.count))
  const individualCount = records.filter((r) => r.type === 'Individual').length
  const companyCount = records.length - individualCount
  const scored = records.filter((r) => r.score !== null)
  const avgScore = scored.length ? Math.round(scored.reduce((sum, r) => sum + (r.score ?? 0), 0) / scored.length) : null

  const editingRecord = modal?.mode === 'edit' ? records.find((r) => r.id === modal.id) : undefined

  const handleSave = (values: RecordFormValues) => {
    if (modal?.mode === 'edit' && editingRecord) {
      setRecords((rs) =>
        rs.map((r) =>
          r.id === editingRecord.id
            ? { ...r, ...values, lastModified: new Date().toISOString() }
            : r,
        ),
      )
    } else {
      setRecords((rs) => [
        { id: `local-${Date.now()}`, ...values, score: null, lastModified: new Date().toISOString() },
        ...rs,
      ])
    }
    setModal(null)
  }

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
          <div className="bento-grid">
            <article className="slds-card bento-cta">
              <div className="slds-card__body slds-card__body_inner cta-body">
                <div>
                  <p className="cta-eyebrow">Invite-only onboarding</p>
                  <h2 className="cta-heading">Ready to review the next applicant?</h2>
                  <p className="cta-sub">Log a new invite request the way it would arrive from the public form.</p>
                </div>
                <button
                  type="button"
                  className="slds-button slds-button_brand"
                  onClick={() => setModal({ mode: 'create', id: null })}
                >
                  + New Invite Request
                </button>
              </div>
            </article>

            <div className="slds-box slds-box_x-small stat-tile bento-narrow">
              <p className="stat-label">Total invite requests</p>
              <p className="stat-value">{records.length}</p>
            </div>

            <div className="slds-box slds-box_x-small stat-tile bento-narrow">
              <p className="stat-label">Avg fit score</p>
              <p className="stat-value">{avgScore ?? '—'}</p>
              {avgScore === null && <p className="stat-delta">Not yet scored</p>}
            </div>

            <article className="slds-card bento-wide">
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
                        <div className="funnel-bar" style={{ width: `${(s.count / maxStageCount) * 100}%` }} />
                      </div>
                      <span className="funnel-value">{s.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </article>

            <article className="slds-card bento-narrow">
              <div className="slds-card__header slds-grid">
                <header className="slds-media slds-media_center slds-has-flexi-truncate">
                  <div className="slds-media__body">
                    <h2 className="slds-card__header-title">Applicant type</h2>
                  </div>
                </header>
              </div>
              <div className="slds-card__body slds-card__body_inner">
                <div className="split-bar">
                  <div
                    className="split-segment split-individual"
                    style={{ width: `${records.length ? (individualCount / records.length) * 100 : 0}%` }}
                  />
                  <div
                    className="split-segment split-company"
                    style={{ width: `${records.length ? (companyCount / records.length) * 100 : 0}%` }}
                  />
                </div>
                <ul className="split-legend">
                  <li>
                    <span className="split-swatch split-individual" aria-hidden="true" /> Individual {individualCount}
                  </li>
                  <li>
                    <span className="split-swatch split-company" aria-hidden="true" /> Company {companyCount}
                  </li>
                </ul>
              </div>
            </article>

            <article className="slds-card bento-narrow">
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

            <article className="slds-card bento-full">
              <div className="slds-card__header slds-grid">
                <header className="slds-media slds-media_center slds-has-flexi-truncate">
                  <div className="slds-media__body">
                    <h2 className="slds-card__header-title">Invite Requests</h2>
                  </div>
                </header>
                <div className="slds-no-flex">
                  <button
                    type="button"
                    className="slds-button slds-button_neutral"
                    onClick={() => setModal({ mode: 'create', id: null })}
                  >
                    + New
                  </button>
                </div>
              </div>

              <div className="table-filters slds-p-horizontal_medium slds-p-top_small">
                <div className="slds-button-group" role="group" aria-label="Filter by applicant type">
                  {typeFilters.map((t) => (
                    <button
                      key={t}
                      type="button"
                      aria-pressed={typeFilter === t}
                      className={`slds-button slds-button_neutral filter-toggle ${typeFilter === t ? 'is-active' : ''}`}
                      onClick={() => setTypeFilter(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <div className="slds-select_container filter-select">
                  <select className="slds-select" value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}>
                    <option value="All">All stages</option>
                    {stageOrder.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
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
                      <th scope="col">
                        <div className="slds-truncate">Actions</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={8}>
                          <div className="slds-align_absolute-center slds-p-around_medium slds-text-color_weak">
                            No invite requests match this filter.
                          </div>
                        </td>
                      </tr>
                    )}
                    {filtered.map((r) => (
                      <tr key={r.id}>
                        <th scope="row">
                          <div className="slds-truncate">
                            {r.firstName} {r.lastName}
                          </div>
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
                        <td>
                          <button
                            type="button"
                            className="slds-button slds-button_reset row-edit-link"
                            onClick={() => setModal({ mode: 'edit', id: r.id })}
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          </div>

          <p className="app-disclaimer">
            Independent educational project — not affiliated with, endorsed by, or connected to
            Stripe.
          </p>
        </main>
      </div>

      {modal && (
        <RecordModal
          mode={modal.mode}
          stageOptions={stageOrder}
          initialValues={
            editingRecord
              ? {
                  firstName: editingRecord.firstName,
                  lastName: editingRecord.lastName,
                  email: editingRecord.email,
                  country: editingRecord.country,
                  type: editingRecord.type,
                  stage: editingRecord.stage,
                }
              : blankForm
          }
          onCancel={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}

export default App
