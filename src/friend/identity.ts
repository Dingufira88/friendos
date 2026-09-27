import { ARCHETYPES, type Archetype, type FriendIdentity, type FriendToken } from './types'

const skills: Record<Archetype, [string, string]> = {
  Analyst: ['Research', 'Crypto'],
  Creator: ['Writing', 'Creative'],
  Scout: ['Discovery', 'Research'],
  Strategist: ['Strategy', 'Writing'],
  Oracle: ['Synthesis', 'Crypto'],
  Builder: ['Coding', 'Strategy'],
}

const traitPool = [
  'Curious', 'Precise', 'Patient', 'Inventive', 'Bold', 'Cautious',
  'Playful', 'Focused', 'Resourceful', 'Observant', 'Direct', 'Methodical',
]

function hash(value: string) {
  let result = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index)
    result = Math.imul(result, 16777619)
  }
  return result >>> 0
}

export function createFriendIdentity(token: FriendToken): FriendIdentity {
  const seed = hash(`${token.collection}:${token.tokenId}:${token.generation}`)
  const archetype = ARCHETYPES[seed % ARCHETYPES.length]
  const [primarySkill, secondarySkill] = skills[archetype]
  const offset = Math.floor(seed / ARCHETYPES.length)

  return {
    ...token,
    archetype,
    primarySkill,
    secondarySkill,
    traits: [
      traitPool[offset % traitPool.length],
      traitPool[(offset + 5) % traitPool.length],
      traitPool[(offset + 9) % traitPool.length],
    ],
  }
}
