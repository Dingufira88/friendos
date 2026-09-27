import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
  xpEarned: number
  credEarned: number
}

export interface FriendProgress {
  balance: number
  xp: number
  cred: number
  missionCount: number
  rfSpent: number
  rfBurned: number
  history: MissionRecord[]
}

interface ProgressionState {
  friends: Record<string, FriendProgress>
  completeMission: (friendId: string, request: string) => MissionRecord
  resetFriend: (friendId: string) => void
}

export const initialProgress = (): FriendProgress => ({
  balance: 100,
  xp: 0,
  cred: 0,
  missionCount: 0,
  rfSpent: 0,
  rfBurned: 0,
  history: [],
})

function createReceiptId(friendId: string, count: number) {
  return `FOS-${friendId}-${String(count).padStart(4, '0')}`
}

export const useProgressionStore = create<ProgressionState>()(
  persist(
    (set, get) => ({
      friends: {},
      completeMission: (friendId, request) => {
        const current = get().friends[friendId] ?? initialProgress()
        const nextCount = current.missionCount + 1
        const record: MissionRecord = {
          receiptId: createReceiptId(friendId, nextCount),
          missionId: 'research',
          missionName: 'Research Mission',
          request,
          completedAt: new Date().toISOString(),
          rfSpent: 5,
          rfBurned: 2.5,
          computeAllocation: 2,
          ecosystemAllocation: 0.5,
          xpEarned: 50,
          credEarned: 3,
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
