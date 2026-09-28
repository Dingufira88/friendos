import { z } from 'zod'
import { createDemoReport, type ResearchReport } from '../missions/demoAgent'
import type { FriendIdentity } from '../friend/types'

const reportSchema = z.object({
  summary: z.string().min(1),
  findings: z.array(z.string().min(1)).length(3),
  opportunities: z.array(z.string().min(1)).length(3),
  nextActions: z.array(z.string().min(1)).length(3),
})

export type AgentSource = 'openai' | 'fallback'

export interface MissionSkillContext {
  installedSkills: string[]
  skillMastery: Record<string, number>
}

export async function executeResearchMission(request: string, friend: FriendIdentity, missionId = 'research', skills?: MissionSkillContext): Promise<{ report: ResearchReport; source: AgentSource }> {
  try {
    const response = await fetch('/api/mission', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        request,
        missionId,
        friend: { name: friend.name, archetype: friend.archetype, traits: friend.traits, primarySkill: friend.primarySkill },
        skills,
      }),
      signal: AbortSignal.timeout(20_000),
    })
    if (!response.ok) throw new Error(`Agent endpoint returned ${response.status}`)
    const payload = await response.json() as { report?: unknown; source?: unknown }
    return { report: reportSchema.parse(payload.report), source: payload.source === 'openai' ? 'openai' : 'fallback' }
  } catch {
    return { report: createDemoReport(request, missionId), source: 'fallback' }
  }
}
