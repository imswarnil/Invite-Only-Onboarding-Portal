import { useState } from 'react'

export interface RecordFormValues {
  firstName: string
  lastName: string
  email: string
  country: string
  type: 'Individual' | 'Company'
  stage: string
}

interface RecordModalProps {
  mode: 'create' | 'edit'
  initialValues: RecordFormValues
  stageOptions: string[]
  onCancel: () => void
  onSave: (values: RecordFormValues) => void
}

function RecordModal({ mode, initialValues, stageOptions, onCancel, onSave }: RecordModalProps) {
  const [values, setValues] = useState(initialValues)
  const [error, setError] = useState<string | null>(null)

  const set = (field: keyof RecordFormValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setValues((v) => ({ ...v, [field]: e.target.value }))
  }

  const handleSave = () => {
    if (!values.firstName.trim() || !values.lastName.trim() || !values.email.trim()) {
      setError('First name, last name, and work email are required.')
      return
    }
    onSave(values)
  }

  return (
    <>
      <section role="dialog" aria-modal="true" aria-labelledby="record-modal-heading" className="slds-modal slds-fade-in-open">
        <div className="slds-modal__container">
          <header className="slds-modal__header">
            <button
              type="button"
              className="slds-button slds-button_icon slds-modal__close slds-button_icon-inverse"
              onClick={onCancel}
              title="Close"
            >
              <span aria-hidden="true">×</span>
              <span className="slds-assistive-text">Close</span>
            </button>
            <h2 id="record-modal-heading" className="slds-text-heading_medium slds-hyphenate">
              {mode === 'create' ? 'New Invite Request' : 'Edit Invite Request'}
            </h2>
          </header>
          <div className="slds-modal__content slds-p-around_medium">
            {error && (
              <div className="slds-notify slds-notify_alert slds-theme_alert-texture slds-theme_error slds-m-bottom_small" role="alert">
                <span>{error}</span>
              </div>
            )}
            <div className="slds-grid slds-wrap slds-gutters">
              <div className="slds-col slds-size_1-of-2 slds-form-element">
                <label className="slds-form-element__label" htmlFor="firstName">
                  First Name
                </label>
                <div className="slds-form-element__control">
                  <input
                    id="firstName"
                    className="slds-input"
                    value={values.firstName}
                    onChange={set('firstName')}
                  />
                </div>
              </div>
              <div className="slds-col slds-size_1-of-2 slds-form-element">
                <label className="slds-form-element__label" htmlFor="lastName">
                  Last Name
                </label>
                <div className="slds-form-element__control">
                  <input
                    id="lastName"
                    className="slds-input"
                    value={values.lastName}
                    onChange={set('lastName')}
                  />
                </div>
              </div>
              <div className="slds-col slds-size_1-of-1 slds-form-element">
                <label className="slds-form-element__label" htmlFor="email">
                  Work Email
                </label>
                <div className="slds-form-element__control">
                  <input
                    id="email"
                    type="email"
                    className="slds-input"
                    value={values.email}
                    onChange={set('email')}
                  />
                </div>
              </div>
              <div className="slds-col slds-size_1-of-2 slds-form-element">
                <label className="slds-form-element__label" htmlFor="country">
                  Country
                </label>
                <div className="slds-form-element__control">
                  <input id="country" className="slds-input" value={values.country} onChange={set('country')} />
                </div>
              </div>
              <div className="slds-col slds-size_1-of-2 slds-form-element">
                <label className="slds-form-element__label" htmlFor="type">
                  Applicant Type
                </label>
                <div className="slds-form-element__control">
                  <div className="slds-select_container">
                    <select id="type" className="slds-select" value={values.type} onChange={set('type')}>
                      <option value="Individual">Individual</option>
                      <option value="Company">Company</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="slds-col slds-size_1-of-1 slds-form-element">
                <label className="slds-form-element__label" htmlFor="stage">
                  Stage
                </label>
                <div className="slds-form-element__control">
                  <div className="slds-select_container">
                    <select id="stage" className="slds-select" value={values.stage} onChange={set('stage')}>
                      {stageOptions.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <footer className="slds-modal__footer">
            <button type="button" className="slds-button slds-button_neutral" onClick={onCancel}>
              Cancel
            </button>
            <button type="button" className="slds-button slds-button_brand" onClick={handleSave}>
              Save
            </button>
          </footer>
        </div>
      </section>
      <div className="slds-backdrop slds-backdrop_open"></div>
    </>
  )
}

export default RecordModal
