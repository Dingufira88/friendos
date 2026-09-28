export const ARCHETYPES = ['Analyst', 'Creator', 'Scout', 'Strategist', 'Oracle', 'Builder'] as const

export type Archetype = (typeof ARCHETYPES)[number]

export interface FriendToken {
  collection: string
  tokenId: string
  generation: number
  name: string
  color: string
  glyph: string
  walletAddress?: string
  familyName?: string
  spriteRows?: readonly string[]
  avatarIndex?: number
}

export interface FriendIdentity extends FriendToken {
  archetype: Archetype
  primarySkill: string
  secondarySkill: string
  traits: [string, string, string]
}
