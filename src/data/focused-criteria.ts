export type FocusedCriterion = { id: string; section: string; title: string; question: string; type: 'binary' | 'rating' | 'number' | 'single' | 'multi'; critical?: boolean; weighted?: number; evidence?: 'required'; values?: string[]; unit?: string; guide: string }
export const sections = ['Preparation','Frying','Completion'] as const
export const focusedCriteria: FocusedCriterion[] = [
  {
    "id": "p1",
    "section": "Preparation",
    "title": "Check fryer readiness and oil conditions",
    "question": "Is the fryer ready for safe operation and have the oil checks been completed?",
    "type": "binary",
    "critical": true,
    "guide": "Observe the station and confirm the required checks were completed. Actual standards come from the published assessment template."
  },
  {
    "id": "p2",
    "section": "Preparation",
    "title": "Prepare a clean, safe station",
    "question": "Did Dre prepare a clean, organised and safe workstation?",
    "type": "binary",
    "critical": true,
    "evidence": "required",
    "guide": "Evidence is required in this illustrative template. In a real workflow, the published task determines whether a note or photo is necessary."
  },
  {
    "id": "p3",
    "section": "Preparation",
    "title": "Record the portion weight",
    "question": "What was the observed weight of the portion?",
    "type": "number",
    "unit": "g",
    "weighted": 2,
    "guide": "Example numeric response. The configured template would define tolerances and how this result affects any score."
  },
  {
    "id": "f1",
    "section": "Frying",
    "title": "Lower the basket safely",
    "question": "Did Dre lower the fryer basket following the required safety procedure?",
    "type": "binary",
    "critical": true,
    "guide": "Observe the handling technique directly; do not infer unobserved safety steps."
  },
  {
    "id": "f2",
    "section": "Frying",
    "title": "Rate handling technique",
    "question": "How would you rate Dre\u2019s overall handling technique?",
    "type": "rating",
    "weighted": 3,
    "guide": "Illustrative 1\u20135 rating scale. Descriptions and thresholds would be configured and validated with the customer."
  },
  {
    "id": "f3",
    "section": "Frying",
    "title": "Select the cooking programme used",
    "question": "Which programme did Dre select?",
    "type": "single",
    "values": [
      "Standard programme",
      "Small batch",
      "Other / custom"
    ],
    "guide": "Options are illustrative. The actual programmes depend on the fryer model and local operating procedure."
  },
  {
    "id": "f4",
    "section": "Frying",
    "title": "Record observed safety steps",
    "question": "Which steps did you see Dre complete?",
    "type": "multi",
    "values": [
      "Maintained a safe working distance",
      "Followed the cooking signal",
      "Lifted and drained the basket safely"
    ],
    "guide": "Selecting a step means it was observed; unselected does not automatically mean failed."
  },
  {
    "id": "c1",
    "section": "Completion",
    "title": "Rate final product quality",
    "question": "How would you rate the finished product against the required quality standard?",
    "type": "rating",
    "weighted": 2,
    "guide": "An example rating; the expected standard and scoring model must come from the published template."
  },
  {
    "id": "c2",
    "section": "Completion",
    "title": "Transfer and hold product correctly",
    "question": "Was the finished product transferred and held according to the local procedure?",
    "type": "binary",
    "guide": "The exact process and any critical conditions depend on the restaurant\u2019s operating standard."
  }
]
export type FocusedAnswer = string | number | string[]
export type FocusedAnswers = Record<string, FocusedAnswer | undefined>
export function validAnswer(c: FocusedCriterion, value: unknown): value is FocusedAnswer {
  if (c.type === 'binary') return value === 'met' || value === 'not'
  if (c.type === 'rating') return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 5
  if (c.type === 'number') return typeof value === 'number' && Number.isFinite(value) && value >= 0
  if (c.type === 'single') return typeof value === 'string' && !!c.values?.includes(value)
  return Array.isArray(value) && value.length > 0 && value.every(v => typeof v === 'string' && c.values?.includes(v)) && new Set(value).size === value.length
}
export function isComplete(c: FocusedCriterion, answers: FocusedAnswers, notes: Record<string,string>, photos: Record<string,number>) {
  return validAnswer(c,answers[c.id]) && (c.evidence !== 'required' || !!notes[c.id]?.trim() || !!photos[c.id])
}
export function answerSummary(c: FocusedCriterion, value: unknown) {
  if (!validAnswer(c,value)) return ''
  if(c.type === 'binary') return value === 'met' ? 'Met' : 'Needs work'
  if(c.type === 'rating') return `${value} / 5`
  if(c.type === 'number') return `${value} ${c.unit ?? ''}`.trim()
  if(c.type === 'multi') return `${(value as string[]).length} selected`
  return String(value)
}
