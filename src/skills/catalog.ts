export interface SkillDefinition {
  id: string
  name: string
  description: string
  developer: string
  category: string
  price: number
  icon: string
  usageCost: number
  developerShare: number
}

export const skillCatalog: SkillDefinition[] = [
  { id: 'deep-research', name: 'Deep Research', description: 'Investigates a brief, compares sources, and produces an actionable report.', developer: 'FriendOS Core', category: 'KNOWLEDGE', price: 0, usageCost: 5, developerShare: 0, icon: '⌕' },
  { id: 'social-signal', name: 'Social Signal', description: 'Finds emerging narratives and turns them into a concise opportunity map.', developer: 'By Signal Works', category: 'DISCOVERY', price: 12, usageCost: 3, developerShare: 20, icon: '⌁' },
  { id: 'launch-writer', name: 'Launch Writer', description: 'Creates announcements, threads, and campaign copy in your Friend’s voice.', developer: 'By Noun Studio', category: 'CREATIVE', price: 15, usageCost: 3, developerShare: 20, icon: '✎' },
  { id: 'onchain-scout', name: 'Onchain Scout', description: 'Tracks contracts, wallets, and activity to surface useful movements.', developer: 'By Blocksmiths', category: 'CRYPTO', price: 20, usageCost: 4, developerShare: 20, icon: '◇' },
]
