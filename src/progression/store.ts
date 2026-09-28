import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { missions } from '../missions/definitions'
import { skillCatalog } from '../skills/catalog'

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
}

export interface WalletTransaction {
  id: string
  type: 'funding' | 'mission' | 'skill'
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
}

interface ProgressionState {
  friends: Record<string, FriendProgress>
  completeMission: (friendId: string, request: string, missionId?: string) => MissionRecord
  resetFriend: (friendId: string) => void
  installSkill: (friendId: string, skillId: string, price: number) => boolean
  fundWallet: (friendId: string, amount: number) => boolean
  setWalletPolicy: (friendId: string, dailyLimit: number, perMissionLimit: number, autoApprove: boolean) => void
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
      completeMission: (friendId, request, missionId = 'research') => {
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
              history: [record, ...current.history],
              installedSkills: current.installedSkills ?? ['deep-research'],
              skillMastery: { ...(current.skillMastery ?? {}), [mission.skillId]: (current.skillMastery?.[mission.skillId] ?? 0) + (current.installedSkills.includes(mission.skillId) ? 25 : 8) },
              dailyLimit: current.dailyLimit ?? 25,
              perMissionLimit: current.perMissionLimit ?? 10,
              autoApprove: current.autoApprove ?? true,
              transactions: [{ id: record.receiptId, type: 'mission', label: record.missionName, amount: -record.rfSpent, createdAt: record.completedAt }, ...(current.transactions ?? [])],
            },
          },
        }))

        return record
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
