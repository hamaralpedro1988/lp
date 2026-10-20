/** Explicit fixture from the approved overview mockup; not an LMS integration. */
export type SpatialLearningResult = { activity: string; score: string; example: boolean }
export const spatialOverviewLearning: SpatialLearningResult = { activity: 'Fryer Station', score: '8.4', example: true }

/** Assessment-specific illustrative estimate, not time per task. */
export const spatialAssessmentPreparation = { estimatedMinutes: 15 } as const

/** This assessment requires the designated manager's approval after submission. */
export const spatialAssessmentPolicy = { managerApprovalRequired: true } as const
