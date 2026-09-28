import type { ReviewAction } from './demoAgent'

export function reviewSkillId(action: ReviewAction, missionSkillId: string) {
  if (action === 'clarify') return 'deep-research'
  if (action === 'challenge') return 'social-signal'
  return missionSkillId
}

export function reviewCost(action: ReviewAction) {
  if (action === 'challenge') return 1
  if (action === 'refine') return 2
  return 0
}
