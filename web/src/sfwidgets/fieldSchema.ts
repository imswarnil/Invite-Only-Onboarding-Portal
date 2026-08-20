// Field schema for the custom React record page. Picklist values are hardcoded here to
// match what's deployed in force-app/main/default/objects/Invite_Request__c/fields — if
// those value sets change, update both places. (A follow-up upgrade would fetch these via
// the `getPicklistValuesByRecordType` wire adapter instead of duplicating them.)

export type FieldType =
  | 'text'
  | 'textarea'
  | 'email'
  | 'phone'
  | 'url'
  | 'checkbox'
  | 'number'
  | 'currency'
  | 'picklist'
  | 'readonly'
  | 'richtext-readonly'

export interface FieldSpec {
  api: string
  label: string
  type: FieldType
  options?: string[]
  helpText?: string
  showWhen?: (record: Record<string, unknown>) => boolean
}

export interface SectionSpec {
  label: string
  fields: FieldSpec[]
}

const REVENUE_BANDS = ['0-10L INR', '10L-50L INR', '50L-1Cr INR', '1Cr-5Cr INR', '5Cr-25Cr INR', '25Cr and above INR']
const JOB_LEVELS = ['Founder/Owner', 'C-Level', 'VP/Director', 'Manager', 'Individual Contributor']
const JOB_FUNCTIONS = ['Finance', 'Engineering', 'Product', 'Operations', 'Other']
const SELLS = ['Services', 'Goods', 'Both']
const STAGES = ['Received', 'AI Validation', 'Action Needed', 'In Review', 'Approved', 'Onboarding', 'Activated', 'Won', 'Waitlisted', 'Rejected']
const DECISIONS = ['Pending', 'Approved', 'Waitlisted', 'Rejected']

export const SECTIONS: SectionSpec[] = [
  {
    label: 'Applicant Details',
    fields: [
      { api: 'Applicant_Type__c', label: 'Applicant Type', type: 'picklist', options: ['Company', 'Individual'] },
      { api: 'First_Name__c', label: 'First Name', type: 'text' },
      { api: 'Last_Name__c', label: 'Last Name', type: 'text' },
      { api: 'Work_Email__c', label: 'Work Email', type: 'email' },
      { api: 'Phone__c', label: 'Phone', type: 'phone' },
      { api: 'Phone_Verified__c', label: 'Phone Verified', type: 'checkbox' },
      { api: 'Country__c', label: 'Country', type: 'text' },
      { api: 'State__c', label: 'State', type: 'text' },
      { api: 'City__c', label: 'City', type: 'text' },
    ],
  },
  {
    label: 'Business Details',
    fields: [
      { api: 'Company_Website__c', label: 'Company Website', type: 'url' },
      { api: 'Job_Level__c', label: 'Job Level', type: 'picklist', options: JOB_LEVELS },
      { api: 'Job_Function__c', label: 'Job Function', type: 'picklist', options: JOB_FUNCTIONS },
      { api: 'Sells__c', label: 'Sells', type: 'picklist', options: SELLS },
      { api: 'Annual_Revenue_Band__c', label: 'Annual Revenue Band', type: 'picklist', options: REVENUE_BANDS },
      { api: 'Expected_Revenue_INR__c', label: 'Expected Revenue (INR)', type: 'currency' },
      { api: 'Has_Overseas_Entity__c', label: 'Has Overseas Entity', type: 'checkbox' },
      { api: 'Seeking_Overseas_Expansion__c', label: 'Seeking Overseas Expansion', type: 'checkbox' },
      { api: 'GST_Number__c', label: 'GST Number', type: 'text' },
      {
        api: 'Company_Registration_Number__c',
        label: 'Company Registration Number',
        type: 'text',
        showWhen: (r) => r.Applicant_Type__c === 'Company',
      },
      {
        api: 'PAN_Number__c',
        label: 'PAN Number',
        type: 'text',
        showWhen: (r) => r.Applicant_Type__c === 'Individual',
      },
    ],
  },
  {
    label: 'Research & Scoring',
    fields: [
      { api: 'Registered_Entity_Type__c', label: 'Registered Entity Type', type: 'readonly' },
      { api: 'Has_IEC__c', label: 'Has IEC', type: 'readonly' },
      { api: 'MCA_CIN__c', label: 'MCA CIN', type: 'readonly' },
      { api: 'Blog_Count__c', label: 'Blog Count', type: 'readonly' },
      { api: 'Content_Depth__c', label: 'Content Depth', type: 'readonly' },
      { api: 'Fit_Score__c', label: 'Fit Score', type: 'readonly' },
      { api: 'Legitimacy_Verdict__c', label: 'Legitimacy Verdict', type: 'readonly' },
      { api: 'Expansion_Signal__c', label: 'Expansion Signal', type: 'readonly' },
      { api: 'Persona__c', label: 'Persona', type: 'readonly' },
      { api: 'Score_Rationale__c', label: 'Score Rationale', type: 'richtext-readonly' },
      { api: 'Dossier__c', label: 'Dossier', type: 'richtext-readonly' },
    ],
  },
  {
    label: 'Pipeline',
    fields: [
      { api: 'Stage__c', label: 'Stage', type: 'picklist', options: STAGES },
      { api: 'Sub_Status__c', label: 'Sub Status', type: 'text', helpText: 'Free text here for now — the dependent-picklist UX (values scoped to Stage) is a follow-up upgrade.' },
      { api: 'Decision__c', label: 'Decision', type: 'picklist', options: DECISIONS },
    ],
  },
  {
    label: 'Additional Information',
    fields: [
      { api: 'Notes__c', label: 'Notes', type: 'textarea' },
      { api: 'Marketing_Consent__c', label: 'Marketing Consent', type: 'checkbox' },
    ],
  },
]

export const ALL_FIELD_APIS: string[] = SECTIONS.flatMap((s) => s.fields.map((f) => f.api))
export const EDITABLE_FIELD_APIS: string[] = SECTIONS.flatMap((s) =>
  s.fields.filter((f) => f.type !== 'readonly' && f.type !== 'richtext-readonly').map((f) => f.api),
)
