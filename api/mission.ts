const reportSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    summary: { type: 'string' },
    findings: { type: 'array', items: { type: 'string' }, minItems: 3, maxItems: 3 },
    opportunities: { type: 'array', items: { type: 'string' }, minItems: 3, maxItems: 3 },
    nextActions: { type: 'array', items: { type: 'string' }, minItems: 3, maxItems: 3 },
  },
  required: ['summary', 'findings', 'opportunities', 'nextActions'],
} as const

const missionProfiles = {
  'quick-ask': {
    name: 'Quick Ask',
    purpose: 'Answer the user directly and efficiently. Lead with the decision or conclusion, distinguish facts from inference, and avoid turning the response into a broad research report.',
  },
  content: {
    name: 'Social Content',
    purpose: 'Create platform-ready social messaging. Findings should explain audience, hook, and format choices; opportunities should be testable creative angles; next actions should form a practical publishing plan.',
  },
  research: {
    name: 'Blockchain Analytics',
    purpose: 'Produce an evidence-conscious onchain analysis. Identify the metrics, entities, time windows, and assumptions that matter. Never invent transactions, balances, links, or browsing access; clearly state when live data is required.',
  },
  strategy: {
    name: 'Narrative Strategy',
    purpose: 'Pressure-test positioning and turn it into a focused market narrative. Identify audience tension, differentiation, proof, risks, and measurable experiments.',
  },
  advanced: {
    name: 'Advanced Agent',
    purpose: 'Break the request into a multi-step operating plan. Surface dependencies, decision gates, failure modes, and the sequence in which work should be executed.',
  },
  deep: {
    name: 'Deep Mission',
    purpose: 'Treat the request as a complex investigation. Compare competing explanations, identify evidence gaps, express uncertainty, and provide a staged validation plan.',
  },
} as const

type MissionId = keyof typeof missionProfiles

function normalizeMissionId(value: unknown): MissionId {
  return typeof value === 'string' && value in missionProfiles ? value as MissionId : 'research'
}

export default async function handler(request: Request) {
  if (request.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 })
  if (!process.env.OPENAI_API_KEY) return Response.json({ error: 'AI provider is not configured' }, { status: 503 })

  const body = await request.json().catch(() => null) as null | {
    request?: unknown
    missionId?: unknown
    friend?: { name?: unknown; archetype?: unknown; traits?: unknown; primarySkill?: unknown }
    skills?: { installedSkills?: unknown; skillMastery?: unknown }
  }
  if (!body || typeof body.request !== 'string' || body.request.trim().length < 3 || body.request.length > 500) {
    return Response.json({ error: 'Invalid mission request' }, { status: 400 })
  }

  const friend = body.friend ?? {}
  const missionId = normalizeMissionId(body.missionId)
  const mission = missionProfiles[missionId]
  const installedSkills = Array.isArray(body.skills?.installedSkills)
    ? body.skills.installedSkills.filter((skill): skill is string => typeof skill === 'string').slice(0, 12)
    : []
  const mastery = body.skills?.skillMastery && typeof body.skills.skillMastery === 'object'
    ? Object.entries(body.skills.skillMastery).filter((entry): entry is [string, number] => typeof entry[1] === 'number').slice(0, 12)
    : []
  const skillContext = installedSkills.length
    ? `Installed skills: ${installedSkills.join(', ')}. Mastery: ${mastery.map(([skill, xp]) => `${skill} ${xp} XP`).join(', ') || 'newly installed'}. Let relevant skills shape the method and specificity, but do not claim capabilities or data access you do not have.`
    : 'No marketplace skills are installed. Rely on the operator’s native traits and be candid about capability limits.'
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? 'gpt-6-astra',
      store: false,
      instructions: `You are ${String(friend.name ?? 'a Rare Friend')}, a ${String(friend.archetype ?? 'curious operator')} acting as the user’s persistent Rare Friends NFT operator. Your traits are ${Array.isArray(friend.traits) ? friend.traits.join(', ') : 'curious and useful'}, and your native specialty is ${String(friend.primarySkill ?? 'research')}.

Mission type: ${mission.name}.
Mission behavior: ${mission.purpose}
Skill context: ${skillContext}

Return a useful, specific report for this mission type. The summary must answer the request rather than describe your process. Each list item must contain concrete reasoning and must not repeat another section. Never invent sources, links, metrics, transactions, or claim you browsed unless the user supplied that evidence. When current external data is necessary, identify exactly what must be verified.`,
      input: body.request.trim(),
      text: { format: { type: 'json_schema', name: `friendos_${missionId.replace('-', '_')}_report`, strict: true, schema: reportSchema } },
    }),
  })

  if (!response.ok) return Response.json({ error: 'AI mission failed' }, { status: 502 })
  const data = await response.json() as { output?: Array<{ content?: Array<{ type?: string; text?: string }> }> }
  const outputText = data.output?.flatMap((item) => item.content ?? []).find((item) => item.type === 'output_text')?.text
  if (!outputText) return Response.json({ error: 'AI returned no report' }, { status: 502 })
  return Response.json({ report: JSON.parse(outputText), source: 'openai' })
}
