export type Criterion = { id: string; section: string; title: string; critical?: boolean; weight: number; evidence: 'optional' | 'noteIfNot'; question: string; guidance: string }
export const sections = ['Preparation', 'Frying', 'Completion'] as const
export const criteria: Criterion[] = [
  {
    "id": "p1",
    "section": "Preparation",
    "title": "Check fryer readiness and oil conditions",
    "critical": true,
    "weight": 2,
    "evidence": "optional",
    "question": "Did Dre verify the fryer was ready and the oil was in acceptable condition?",
    "guidance": "Observe the applicable checks before starting. Confirm that the fryer appears ready and Dre follows the locally defined operating procedure."
  },
  {
    "id": "p2",
    "section": "Preparation",
    "title": "Prepare a clean, safe station",
    "weight": 1,
    "evidence": "optional",
    "question": "Did Dre prepare a clean and safe work area?",
    "guidance": "Look for the expected preparation and safe handling practices before food preparation begins."
  },
  {
    "id": "p3",
    "section": "Preparation",
    "title": "Check the correct portion",
    "weight": 1,
    "evidence": "optional",
    "question": "Did Dre check that the portion was appropriate?",
    "guidance": "Observe that Dre identifies and prepares the intended portion according to the approved local standard."
  },
  {
    "id": "f1",
    "section": "Frying",
    "title": "Load basket without overcrowding",
    "weight": 2,
    "evidence": "optional",
    "question": "Did Dre load the basket without overcrowding?",
    "guidance": "Observe the loading technique and portion distribution according to local safety and quality procedures."
  },
  {
    "id": "f2",
    "section": "Frying",
    "title": "Lower fryer basket safely",
    "critical": true,
    "weight": 3,
    "evidence": "noteIfNot",
    "question": "Did Dre lower the fryer basket using the required safe handling technique?",
    "guidance": "Observe the handling and movement of the basket. Do not infer correct technique if the critical action was missed."
  },
  {
    "id": "f3",
    "section": "Frying",
    "title": "Select correct cooking programme",
    "weight": 2,
    "evidence": "optional",
    "question": "Did Dre select the correct cooking programme?",
    "guidance": "Confirm Dre identifies and starts the expected programme for the product."
  },
  {
    "id": "f4",
    "section": "Frying",
    "title": "Lift and drain basket safely",
    "critical": true,
    "weight": 3,
    "evidence": "optional",
    "question": "Did Dre lift and drain the basket using the required procedure?",
    "guidance": "Observe safe handling during removal and draining."
  },
  {
    "id": "c1",
    "section": "Completion",
    "title": "Check finished product quality",
    "weight": 2,
    "evidence": "optional",
    "question": "Did Dre check that the finished product met the expected quality standard?",
    "guidance": "Observe how Dre checks the cooked product against the expected standard."
  },
  {
    "id": "c2",
    "section": "Completion",
    "title": "Transfer product to safe holding area",
    "weight": 1,
    "evidence": "optional",
    "question": "Did Dre transfer the finished product safely?",
    "guidance": "Confirm that Dre follows the locally approved transfer and holding process."
  },
  {
    "id": "c3",
    "section": "Completion",
    "title": "Follow freshness and holding rules",
    "weight": 2,
    "evidence": "optional",
    "question": "Did Dre follow the expected freshness and holding rules?",
    "guidance": "Observe the required handling after cooking according to the restaurant\u2019s standard."
  }
]
export type Answer = 'met' | 'not'
export type Responses = Record<string, Answer | undefined>
export function needsEvidence(criterion: Criterion, answers: Responses, notes: Record<string,string>, media: Record<string,number>) {
  return criterion.evidence === 'noteIfNot' && answers[criterion.id] === 'not' && !notes[criterion.id]?.trim() && !media[criterion.id]
}
