import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { missions } from '../missions/definitions'
import { skillCatalog } from '../skills/catalog'
import type { ResearchReport, ReviewAction } from '../missions/demoAgent'
import { reviewCost, reviewSkillId } from '../missions/reviewRouting'

export interface MissionReview {
  id: string
  action: ReviewAction
  instruction: string
  result: ResearchReport
  version: number
  rfSpent: number
  skillId: string
  masteryEarned: number
  completedAt: string
  skillName: string
  skillDeveloper: string
  usedNativeFallback: boolean
  confidence: 'specialist' | 'native'
  rfBurned: number
  computeAllocation: number
  ecosystemAllocation: number
  developerAllocation: number
}

export interface MissionRecord {
  receiptId: string
  missionId: string
  missionName: string
  request: string
  completedAt: string
  rfSpent: number
  rfBurned: number
  computeAllocation: number
  ecosystemAllocation: number
  developerAllocation: number
  skillId: string
  skillName: string
  skillDeveloper: string
  xpEarned: number
  credEarned: number
  report?: ResearchReport
  reviews?: MissionReview[]
  acceptedVersion?: number
  status?: 'in-review' | 'accepted' | 'continued'
  parentReceiptId?: string
  linkedMissionId?: string
}

export type MemoryType = 'conclusion' | 'preference' | 'rejected-direction' | 'workflow'
export interface OperatorMemory { id: string; type: MemoryType; content: string; sourceReceiptId: string; createdAt: string }

export interface WalletTransaction {
  id: string
  type: 'funding' | 'mission' | 'skill' | 'review'
  label: string
  amount: number
  createdAt: string
}

export interface FriendProgress {
  balance: number
  xp: number
  cred: number
  missionCount: number
  rfSpent: number
  rfBurned: number
  history: MissionRecord[]
  installedSkills: string[]
  skillMastery: Record<string, number>
  dailyLimit: number
  perMissionLimit: number
  autoApprove: boolean
  transactions: WalletTransaction[]
  memories: OperatorMemory[]
  focus: { role: string; objective: string; outputStyle: string; topicsToAvoid: string }
  permissions: { allowedMissionIds: string[]; requireConfirmation: boolean }
}

interface ProgressionState {
  friends: Record<string, FriendProgress>
  completeMission: (friendId: string, request: string, missionId?: string, report?: ResearchReport, parentReceiptId?: string) => MissionRecord
  completeReview: (friendId: string, receiptId: string, action: ReviewAction, instruction: string, result: ResearchReport, usedNativeFallback?: boolean) => MissionReview | null
  acceptMissionVersion: (friendId: string, receiptId: string, version: number, memoryTypes: MemoryType[]) => boolean
  updateMemory: (friendId: string, memoryId: string, content: string) => boolean
  deleteMemory: (friendId: string, memoryId: string) => void
  resetFriend: (friendId: string) => void
  installSkill: (friendId: string, skillId: string, price: number) => boolean
  fundWallet: (friendId: string, amount: number) => boolean
  setWalletPolicy: (friendId: string, dailyLimit: number, perMissionLimit: number, autoApprove: boolean) => void
  setOperatorSettings: (friendId: string, focus: FriendProgress['focus'], permissions: FriendProgress['permissions']) => void
}

export const initialProgress = (): FriendProgress => ({
  balance: 100,
  xp: 0,
  cred: 0,
  missionCount: 0,
  rfSpent: 0,
  rfBurned: 0,
  history: [],
  installedSkills: ['deep-research'],
  skillMastery: { 'deep-research': 20 },
  dailyLimit: 25,
  perMissionLimit: 10,
  autoApprove: true,
  transactions: [],
  memories: [],
  focus: { role: 'Independent research operator', objective: 'Turn useful work into verifiable progress.', outputStyle: 'Concise and evidence-led', topicsToAvoid: '' },
  permissions: { allowedMissionIds: ['quick-ask', 'content', 'research', 'strategy'], requireConfirmation: false },
})

function createReceiptId(friendId: string, count: number) {
  return `FOS-${friendId}-${String(count).padStart(4, '0')}`
}

function rfAmount(value: number) {
  return Math.round(value * 100) / 100
}

export const useProgressionStore = create<ProgressionState>()(
  persist(
    (set, get) => ({
      friends: {},
      completeMission: (friendId, request, missionId = 'research', report, parentReceiptId) => {
        const current = { ...initialProgress(), ...get().friends[friendId] }
        const mission = missions.find((item) => item.id === missionId) ?? missions[2]
        const skill = skillCatalog.find((item) => item.id === mission.skillId)
        const skillInstalled = current.installedSkills.includes(mission.skillId)
        const developerAllocation = skillInstalled && skill?.developerShare
          ? rfAmount(mission.rfCost * (skill.developerShare / 100))
          : 0
        const rfBurned = rfAmount(mission.rfCost * 0.5)
        const computeAllocation = rfAmount(mission.rfCost * 0.3)
        const ecosystemAllocation = rfAmount(mission.rfCost - rfBurned - computeAllocation - developerAllocation)
        const nextCount = current.missionCount + 1
        const record: MissionRecord = {
          receiptId: createReceiptId(friendId, nextCount),
          missionId: mission.id,
          missionName: mission.name,
          request,
          completedAt: new Date().toISOString(),
          rfSpent: mission.rfCost,
          rfBurned,
          computeAllocation,
          ecosystemAllocation,
          developerAllocation,
          skillId: mission.skillId,
          skillName: skill?.name ?? mission.skill,
          skillDeveloper: developerAllocation ? skill?.developer ?? 'Community developer' : 'FriendOS ecosystem',
          xpEarned: mission.xpReward,
          credEarned: mission.credReward,
          report,
          reviews: [],
          status: 'in-review',
          parentReceiptId,
        }

        set((state) => ({
          friends: {
            ...state.friends,
            [friendId]: {
              balance: current.balance - record.rfSpent,
              xp: current.xp + record.xpEarned,
              cred: current.cred + record.credEarned,
              missionCount: nextCount,
              rfSpent: current.rfSpent + record.rfSpent,
              rfBurned: current.rfBurned + record.rfBurned,
              history: [record, ...current.history.map((item) => item.receiptId === parentReceiptId ? { ...item, status: 'continued' as const, linkedMissionId: record.receiptId } : item)],
              installedSkills: current.installedSkills ?? ['deep-research'],
              skillMastery: { ...(current.skillMastery ?? {}), [mission.skillId]: (current.skillMastery?.[mission.skillId] ?? 0) + (current.installedSkills.includes(mission.skillId) ? 25 : 8) },
              dailyLimit: current.dailyLimit ?? 25,
              perMissionLimit: current.perMissionLimit ?? 10,
              autoApprove: current.autoApprove ?? true,
              transactions: [{ id: record.receiptId, type: 'mission', label: record.missionName, amount: -record.rfSpent, createdAt: record.completedAt }, ...(current.transactions ?? [])],
              memories: current.memories ?? [],
              focus: current.focus ?? initialProgress().focus,
              permissions: current.permissions ?? initialProgress().permissions,
            },
          },
        }))

        return record
      },
      completeReview: (friendId, receiptId, action, instruction, result, usedNativeFallback = false) => {
        const current = { ...initialProgress(), ...get().friends[friendId] }
        const mission = current.history.find((item) => item.receiptId === receiptId)
        const reviews = mission?.reviews ?? []
        if (!mission || reviews.length >= 3) return null
        const rfSpent = reviewCost(action)
        if (current.balance < rfSpent) return null
        const skillId = reviewSkillId(action, mission.skillId)
        const skill = skillCatalog.find((item) => item.id === skillId)
        const specialist = current.installedSkills.includes(skillId) && !usedNativeFallback
        const developerAllocation = specialist && skill?.developerShare ? rfAmount(rfSpent * skill.developerShare / 100) : 0
        const rfBurned = rfAmount(rfSpent * .5)
        const computeAllocation = rfAmount(rfSpent * .3)
        const ecosystemAllocation = rfAmount(rfSpent - rfBurned - computeAllocation - developerAllocation)
        const review: MissionReview = { id: `${receiptId}-R${reviews.length + 1}`, action, instruction, result, version: reviews.length + 2, rfSpent, skillId, skillName: specialist ? skill?.name ?? mission.skillName : 'Native operator ability', skillDeveloper: developerAllocation ? skill?.developer ?? 'Community developer' : 'FriendOS ecosystem', usedNativeFallback: !specialist, confidence: specialist ? 'specialist' : 'native', masteryEarned: specialist ? (action === 'clarify' ? 5 : 10) : 4, rfBurned, computeAllocation, ecosystemAllocation, developerAllocation, completedAt: new Date().toISOString() }
        const updatedMission: MissionRecord = { ...mission, reviews: [...reviews, review], status: 'in-review' }
        set((state) => ({ friends: { ...state.friends, [friendId]: {
          ...current,
          balance: current.balance - rfSpent,
          rfSpent: current.rfSpent + rfSpent,
          rfBurned: current.rfBurned + review.rfBurned,
          skillMastery: { ...current.skillMastery, [skillId]: (current.skillMastery[skillId] ?? 0) + review.masteryEarned },
          history: current.history.map((item) => item.receiptId === receiptId ? updatedMission : item),
          transactions: rfSpent ? [{ id: review.id, type: 'review', label: `${mission.missionName} · ${action}`, amount: -rfSpent, createdAt: review.completedAt }, ...current.transactions] : current.transactions,
        } } }))
        return review
      },
      acceptMissionVersion: (friendId, receiptId, version, memoryTypes) => {
        const current = { ...initialProgress(), ...get().friends[friendId] }
        const mission = current.history.find((item) => item.receiptId === receiptId)
        if (!mission) return false
        const selected = version === 1 ? mission.report : mission.reviews?.find((item) => item.version === version)?.result
        if (!selected) return false
        const now = new Date().toISOString()
        const content: Record<MemoryType, string> = {
          conclusion: selected.summary,
          preference: `Preferred direction: ${mission.reviews?.find((item) => item.version === version)?.instruction || mission.request}`,
          'rejected-direction': selected.findings[0],
          workflow: `${mission.missionName}: ${selected.nextActions.join(' · ')}`,
        }
        const additions = memoryTypes.map((type) => ({ id: `${receiptId}-V${version}-${type}`, type, content: content[type], sourceReceiptId: receiptId, createdAt: now }))
        set((state) => ({ friends: { ...state.friends, [friendId]: { ...current,
          history: current.history.map((item) => item.receiptId === receiptId ? { ...item, acceptedVersion: version, status: 'accepted' as const } : item),
          memories: [...additions.filter((entry) => !(current.memories ?? []).some((saved) => saved.id === entry.id)), ...(current.memories ?? [])],
        } } }))
        return true
      },
      updateMemory: (friendId, memoryId, content) => {
        const current = { ...initialProgress(), ...get().friends[friendId] }
        const nextContent = content.trim()
        if (!nextContent || !(current.memories ?? []).some((memory) => memory.id === memoryId)) return false
        set((state) => ({ friends: { ...state.friends, [friendId]: { ...current, memories: (current.memories ?? []).map((memory) => memory.id === memoryId ? { ...memory, content: nextContent } : memory) } } }))
        return true
      },
      deleteMemory: (friendId, memoryId) => {
        const current = { ...initialProgress(), ...get().friends[friendId] }
        set((state) => ({ friends: { ...state.friends, [friendId]: { ...current, memories: (current.memories ?? []).filter((memory) => memory.id !== memoryId) } } }))
      },
      resetFriend: (friendId) => set((state) => {
        const friends = { ...state.friends }
        delete friends[friendId]
        return { friends }
      }),
      installSkill: (friendId, skillId, price) => {
        const current = { ...initialProgress(), ...get().friends[friendId] }
        if (current.balance < price || current.installedSkills.includes(skillId)) return false
        set((state) => ({ friends: { ...state.friends, [friendId]: { ...current, balance: current.balance - price, rfSpent: current.rfSpent + price, installedSkills: [...current.installedSkills, skillId], skillMastery: { ...current.skillMastery, [skillId]: 0 }, transactions: [{ id: `SKILL-${skillId}-${Date.now()}`, type: 'skill', label: 'Skill installed', amount: -price, createdAt: new Date().toISOString() }, ...current.transactions] } } }))
        return true
      },
      fundWallet: (friendId, amount) => {
        if (!Number.isFinite(amount) || amount <= 0) return false
        const current = { ...initialProgress(), ...get().friends[friendId] }
        set((state) => ({ friends: { ...state.friends, [friendId]: { ...current, balance: current.balance + amount, transactions: [{ id: `FUND-${Date.now()}`, type: 'funding', label: 'Wallet funded', amount, createdAt: new Date().toISOString() }, ...current.transactions] } } }))
        return true
      },
      setWalletPolicy: (friendId, dailyLimit, perMissionLimit, autoApprove) => {
        const current = { ...initialProgress(), ...get().friends[friendId] }
        set((state) => ({ friends: { ...state.friends, [friendId]: { ...current, dailyLimit: Math.max(0, dailyLimit), perMissionLimit: Math.max(0, perMissionLimit), autoApprove } } }))
      },
      setOperatorSettings: (friendId, focus, permissions) => {
        const current = { ...initialProgress(), ...get().friends[friendId] }
        set((state) => ({ friends: { ...state.friends, [friendId]: { ...current, focus, permissions } } }))
      },
    }),
    { name: 'friendos-progression-v1' },
  ),
)

export function levelFromXp(xp: number) {
  const thresholds = [0, 100, 250, 500, 900]
  const level = thresholds.reduce((currentLevel, threshold, index) => xp >= threshold ? index + 1 : currentLevel, 1)
  const currentFloor = thresholds[level - 1] ?? 0
  const nextCeiling = thresholds[level] ?? currentFloor + 500
  return { level, currentFloor, nextCeiling, percent: Math.min(100, ((xp - currentFloor) / (nextCeiling - currentFloor)) * 100) }
}

export function evolutionFromLevel(level: number) {
  return ['AWAKENED', 'CAPABLE', 'SPECIALIST', 'ADVANCED', 'LEGENDARY'][Math.min(4, level - 1)]
}
