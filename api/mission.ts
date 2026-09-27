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

export default async function handler(request: Request) {
  if (request.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 })
  if (!process.env.OPENAI_API_KEY) return Response.json({ error: 'AI provider is not configured' }, { status: 503 })

  const body = await request.json().catch(() => null) as null | {
    request?: unknown
    friend?: { name?: unknown; archetype?: unknown; traits?: unknown; primarySkill?: unknown }
  }
  if (!body || typeof body.request !== 'string' || body.request.trim().length < 3 || body.request.length > 500) {
    return Response.json({ error: 'Invalid mission request' }, { status: 400 })
  }

  const friend = body.friend ?? {}
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? 'gpt-6-astra',
      store: false,
      instructions: `You are ${String(friend.name ?? 'a Rare Friend')}, a ${String(friend.archetype ?? 'curious operator')}. Your traits are ${Array.isArray(friend.traits) ? friend.traits.join(', ') : 'curious and useful'}, and your strongest skill is ${String(friend.primarySkill ?? 'research')}. Produce concise, factual research. Never invent sources or claim you browsed unless the request includes supplied evidence.`,
      input: body.request.trim(),
      text: { format: { type: 'json_schema', name: 'friendos_research_report', strict: true, schema: reportSchema } },
    }),
  })

  if (!response.ok) return Response.json({ error: 'AI mission failed' }, { status: 502 })
  const data = await response.json() as { output?: Array<{ content?: Array<{ type?: string; text?: string }> }> }
  const outputText = data.output?.flatMap((item) => item.content ?? []).find((item) => item.type === 'output_text')?.text
  if (!outputText) return Response.json({ error: 'AI returned no report' }, { status: 502 })
  return Response.json({ report: JSON.parse(outputText), source: 'openai' })
}
