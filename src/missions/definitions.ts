export interface MissionDefinition {
  id: string
  name: string
  description: string
  rfCost: number
  xpReward: number
  credReward: number
  skill: string
  available: boolean
}

export const missions: MissionDefinition[] = [
  { id: 'quick-ask', name: 'Quick Ask', description: 'A fast answer from your operator.', rfCost: 1, xpReward: 5, credReward: 1, skill: 'Synthesis', available: false },
  { id: 'content', name: 'Content Mission', description: 'Turn an idea into social-ready writing.', rfCost: 3, xpReward: 20, credReward: 2, skill: 'Writing', available: false },
  { id: 'research', name: 'Research Mission', description: 'Investigate a topic and return an actionable brief.', rfCost: 5, xpReward: 50, credReward: 3, skill: 'Research', available: true },
  { id: 'strategy', name: 'Strategy Mission', description: 'Pressure-test an idea and propose a plan.', rfCost: 5, xpReward: 50, credReward: 3, skill: 'Strategy', available: false },
  { id: 'advanced', name: 'Advanced Agent', description: 'Use tools across a longer autonomous run.', rfCost: 10, xpReward: 90, credReward: 6, skill: 'Operations', available: false },
  { id: 'deep', name: 'Deep Mission', description: 'A multi-stage investigation for complex questions.', rfCost: 20, xpReward: 150, credReward: 10, skill: 'Research', available: false },
]

export const researchMission = missions.find((mission) => mission.id === 'research')!

export const executionSteps = [
  'Authorizing mission',
  'Spending simulated RF',
  'Understanding request',
  'Planning research',
  'Analysing information',
  'Synthesizing report',
  'Preparing receipt',
] as const
