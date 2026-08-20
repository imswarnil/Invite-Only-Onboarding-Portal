import { useMemo, useState } from 'react'
import { SECTIONS, type FieldSpec } from './fieldSchema'
import './InviteRequestRecordPage.css'

export interface InviteRequestRecordPageProps {
  record: Record<string, unknown>
  recordName: string
  saving: boolean
  error: string | null
  onSave: (changed: Record<string, unknown>) => void
}

function fieldValue(v: unknown): string {
  if (v === null || v === undefined) return ''
  return String(v)
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: FieldSpec
  value: unknown
  onChange: (api: string, value: unknown) => void
}) {
  if (field.type === 'readonly') {
    return <p className="irrp-readonly">{fieldValue(value) || '—'}</p>
  }
  if (field.type === 'richtext-readonly') {
    return (
      <div
        className="irrp-readonly irrp-richtext"
        // Rendered read-only, sourced only from this org's own Prompt Builder / n8n output —
        // never from end-user input, so injecting it as markup here doesn't cross a trust boundary.
        dangerouslySetInnerHTML={{ __html: fieldValue(value) || '<em>Not yet generated</em>' }}
      />
    )
  }
  if (field.type === 'checkbox') {
    return (
      <input
        type="checkbox"
        checked={Boolean(value)}
        onChange={(e) => onChange(field.api, e.target.checked)}
      />
    )
  }
  if (field.type === 'picklist') {
    return (
      <select value={fieldValue(value)} onChange={(e) => onChange(field.api, e.target.value)}>
        <option value="">— Select —</option>
        {field.options?.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    )
  }
  if (field.type === 'textarea') {
    return <textarea value={fieldValue(value)} onChange={(e) => onChange(field.api, e.target.value)} rows={4} />
  }
  const inputType = field.type === 'currency' ? 'number' : field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : field.type === 'phone' ? 'tel' : 'text'
  return <input type={inputType} value={fieldValue(value)} onChange={(e) => onChange(field.api, e.target.value)} />
}

export default function InviteRequestRecordPage({ record, recordName, saving, error, onSave }: InviteRequestRecordPageProps) {
  const [draft, setDraft] = useState<Record<string, unknown>>(record)
  const [dirty, setDirty] = useState<Set<string>>(new Set())

  const handleChange = (api: string, value: unknown) => {
    setDraft((d) => ({ ...d, [api]: value }))
    setDirty((d) => new Set(d).add(api))
  }

  const handleSave = () => {
    const changed: Record<string, unknown> = {}
    for (const api of dirty) changed[api] = draft[api]
    onSave(changed)
  }

  const handleReset = () => {
    setDraft(record)
    setDirty(new Set())
  }

  const isDirty = dirty.size > 0

  const visibleSections = useMemo(
    () =>
      SECTIONS.map((section) => ({
        ...section,
        fields: section.fields.filter((f) => !f.showWhen || f.showWhen(draft)),
      })),
    [draft],
  )

  return (
    <div className="irrp-root">
      <header className="irrp-header">
        <div>
          <p className="irrp-eyebrow">Invite Request</p>
          <h1>{recordName}</h1>
        </div>
        <div className="irrp-header-actions">
          {isDirty && (
            <button type="button" className="irrp-btn irrp-btn-secondary" onClick={handleReset} disabled={saving}>
              Reset
            </button>
          )}
          <button type="button" className="irrp-btn irrp-btn-primary" onClick={handleSave} disabled={!isDirty || saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </header>

      {error && <div className="irrp-error">{error}</div>}

      <div className="irrp-sections">
        {visibleSections.map((section) => (
          <section className="irrp-section" key={section.label}>
            <h2>{section.label}</h2>
            <div className="irrp-grid">
              {section.fields.map((field) => (
                <div className="irrp-field" key={field.api}>
                  <label>{field.label}</label>
                  <FieldInput field={field} value={draft[field.api]} onChange={handleChange} />
                  {field.helpText && <p className="irrp-help">{field.helpText}</p>}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
