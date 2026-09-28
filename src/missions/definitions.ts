export interface MissionDefinition {
  id: string
  name: string
  description: string
  rfCost: number
  xpReward: number
  credReward: number
  skill: string
  available: boolean
  skillId: string
}

export const missions: MissionDefinition[] = [
  { id: 'quick-ask', name: 'Quick Ask', description: 'A fast answer from your operator.', rfCost: 1, xpReward: 5, credReward: 1, skill: 'Synthesis', skillId: 'deep-research', available: true },
  { id: 'content', name: 'Social Content', description: 'Turn an idea into platform-ready social writing.', rfCost: 3, xpReward: 20, credReward: 2, skill: 'Writing', skillId: 'launch-writer', available: true },
  { id: 'research', name: 'Blockchain Analytics', description: 'Investigate onchain data and return an actionable brief.', rfCost: 5, xpReward: 50, credReward: 3, skill: 'Research', skillId: 'onchain-scout', available: true },
  { id: 'strategy', name: 'Narrative Strategy', description: 'Pressure-test a market narrative and propose a plan.', rfCost: 5, xpReward: 50, credReward: 3, skill: 'Strategy', skillId: 'social-signal', available: true },
  { id: 'advanced', name: 'Advanced Agent', description: 'Use tools across a longer autonomous run.', rfCost: 10, xpReward: 90, credReward: 6, skill: 'Operations', skillId: 'deep-research', available: true },
  { id: 'deep', name: 'Deep Mission', description: 'A multi-stage investigation for complex questions.', rfCost: 20, xpReward: 150, credReward: 10, skill: 'Research', skillId: 'deep-research', available: true },
]

export const researchMission = missions.find((mission) => mission.id === 'research')!

export const executionSteps = [
  'Authorizing mission',
  'Powering the mission with RF',
  'Understanding request',
  'Planning research',
  'Analysing information',
  'Synthesizing report',
  'Preparing receipt',
] as const
