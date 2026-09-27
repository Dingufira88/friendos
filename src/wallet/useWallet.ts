import { useCallback, useEffect, useMemo, useState } from 'react'
import { createFriendPublicClient, createFriendWalletSession, type FriendWalletSnapshot } from '@rarefriends/friendsdk/wallet'
import { readOwnedFriends } from '@rarefriends/friendsdk/owned'
import { createGenerationSpriteReader, spriteFrame } from '@rarefriends/friendsdk/sprites'
import type { FriendToken } from '../friend/types'

const accents = ['#69f7d9', '#ffbb55', '#b48cff', '#ff7e9e', '#74a7ff', '#a7ff4f']
const emptySnapshot: FriendWalletSnapshot = { status: 'unavailable', wallets: [], selectedWalletId: null, account: null, chainId: null, revision: 0, error: null }

export function useWallet() {
  const session = useMemo(() => createFriendWalletSession(), [])
  const publicClient = useMemo(() => createFriendPublicClient({ batch: true }), [])
  const spriteReader = useMemo(() => createGenerationSpriteReader(publicClient), [publicClient])
  const [snapshot, setSnapshot] = useState<FriendWalletSnapshot>(() => session.getSnapshot() ?? emptySnapshot)
  const [ownedFriends, setOwnedFriends] = useState<FriendToken[]>([])
  const [loadingFriends, setLoadingFriends] = useState(false)
  const [discoveryError, setDiscoveryError] = useState<string | null>(null)

  useEffect(() => {
    setSnapshot(session.getSnapshot())
    return session.subscribe(() => setSnapshot(session.getSnapshot()))
  }, [session])

  useEffect(() => () => session.dispose(), [session])

  useEffect(() => {
    const controller = new AbortController()
    if (snapshot.status !== 'connected' || !snapshot.account) {
      setOwnedFriends([])
      return () => controller.abort()
    }
    setLoadingFriends(true); setDiscoveryError(null)
    void readOwnedFriends(publicClient, snapshot.account, { signal: controller.signal })
      .then(async ({ friends }) => Promise.all(friends.map(async (owned, index): Promise<FriendToken> => {
        const art = await spriteReader.read(owned.id)
        return {
          collection: 'Rare Friends Generations', tokenId: owned.id.toString(), generation: owned.generation,
          name: `${art.familyName} ${owned.id}`, color: accents[(Number(owned.id % BigInt(accents.length)))],
          glyph: art.familyName.slice(0, 1), familyName: art.familyName, walletAddress: owned.walletAddress,
          spriteRows: spriteFrame(art, 'down', false, index).frame.rows,
        }
      })))
      .then(setOwnedFriends)
      .catch((error: unknown) => { if (!controller.signal.aborted) setDiscoveryError(error instanceof Error ? error.message : 'Could not load your Friends.') })
      .finally(() => { if (!controller.signal.aborted) setLoadingFriends(false) })
    return () => controller.abort()
  }, [publicClient, snapshot.account, snapshot.revision, snapshot.status, spriteReader])

  const connect = useCallback(async () => {
    const result = await session.connect()
    if (result.status === 'wrong-network') await session.switchNetwork()
  }, [session])

  return { ...snapshot, error: snapshot.error ?? discoveryError, connecting: snapshot.status === 'connecting' || snapshot.status === 'switching-network', isRobinhood: snapshot.chainId === 4663, ownedFriends, loadingFriends, connect, switchNetwork: session.switchNetwork, disconnect: session.disconnect }
}
