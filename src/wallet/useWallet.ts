import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { createFriendPublicClient, createFriendWalletSession, type FriendWalletSnapshot } from '@rarefriends/friendsdk/wallet'
import { readOwnedFriends } from '@rarefriends/friendsdk/owned'
import { createGenerationSpriteReader, spriteFrame } from '@rarefriends/friendsdk/sprites'
import type { FriendToken } from '../friend/types'
import { formatUnits } from 'viem'

const accents = ['#69f7d9', '#ffbb55', '#b48cff', '#ff7e9e', '#74a7ff', '#a7ff4f']
const emptySnapshot: FriendWalletSnapshot = { status: 'unavailable', wallets: [], selectedWalletId: null, account: null, chainId: null, revision: 0, error: null }
const RF_TOKEN = '0x0779369854d3EcdEA927206718FFD7730C67B71f' as const

export function useWallet() {
  const session = useMemo(() => createFriendWalletSession(), [])
  const publicClient = useMemo(() => createFriendPublicClient({ batch: true }), [])
  const spriteReader = useMemo(() => createGenerationSpriteReader(publicClient), [publicClient])
  const subscribe = useCallback((onStoreChange: () => void) => session.subscribe(onStoreChange), [session])
  const getSnapshot = useCallback(() => session.getSnapshot() ?? emptySnapshot, [session])
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => emptySnapshot)
  const [ownedFriends, setOwnedFriends] = useState<FriendToken[]>([])
  const [loadedAccount, setLoadedAccount] = useState<string | null>(null)
  const [discoveryError, setDiscoveryError] = useState<{ account: string; message: string } | null>(null)
  const [signedAccount, setSignedAccount] = useState<string | null>(null)
  const [rfBalance, setRfBalance] = useState('0')

  useEffect(() => () => session.dispose(), [session])

  useEffect(() => {
    const controller = new AbortController()
    if (snapshot.status !== 'connected' || !snapshot.account) {
      return () => controller.abort()
    }
    void publicClient.readContract({ address: RF_TOKEN, abi: [{ type: 'function', name: 'balanceOf', stateMutability: 'view', inputs: [{ name: 'account', type: 'address' }], outputs: [{ type: 'uint256' }] }], functionName: 'balanceOf', args: [snapshot.account] }).then((value) => setRfBalance(Number(formatUnits(value, 18)).toLocaleString(undefined, { maximumFractionDigits: 2 }))).catch(() => setRfBalance('0'))
    void readOwnedFriends(publicClient, snapshot.account, { signal: controller.signal })
      .then(async ({ friends }) => Promise.all(friends.slice(0, 3).map(async (owned, index): Promise<FriendToken> => {
        const art = await spriteReader.read(owned.id)
        return {
          collection: 'Rare Friends Generations', tokenId: owned.id.toString(), generation: owned.generation,
          name: `${art.familyName} ${owned.id}`, color: accents[(Number(owned.id % BigInt(accents.length)))],
          glyph: art.familyName.slice(0, 1), familyName: art.familyName, walletAddress: owned.walletAddress,
          spriteRows: spriteFrame(art, 'down', false, index).frame.rows,
          avatarIndex: index,
        }
      })))
      .then((friends) => { setOwnedFriends(friends); setLoadedAccount(snapshot.account); setDiscoveryError(null) })
      .catch((error: unknown) => { if (!controller.signal.aborted) { setDiscoveryError({ account: snapshot.account!, message: error instanceof Error ? error.message : 'Could not load your Friends.' }); setLoadedAccount(snapshot.account) } })
    return () => controller.abort()
  }, [publicClient, snapshot.account, snapshot.revision, snapshot.status, spriteReader])

  const connect = useCallback(async () => {
    const result = await session.connect()
    if (result.status === 'wrong-network') await session.switchNetwork()
  }, [session])

  const signIn = useCallback(async () => {
    const current = session.getSnapshot()
    const provider = session.getProvider()
    if (!provider || !current.account) return false
    const message = `Sign in to FriendOS\n\nVerify ownership to load your Rare Friends and $RAREFRIENDS balance.\n\nAccount: ${current.account}\nNonce: ${Date.now()}`
    try {
      await provider.request({ method: 'personal_sign', params: [message, current.account] })
      setSignedAccount(current.account)
      return true
    } catch { setDiscoveryError({ account: current.account, message: 'Signature request was declined.' }); return false }
  }, [session])

  const disconnect = useCallback(() => { session.disconnect(); setSignedAccount(null) }, [session])

  const connected = snapshot.status === 'connected' && Boolean(snapshot.account)
  const loadingFriends = connected && loadedAccount !== snapshot.account
  const activeDiscoveryError = discoveryError?.account === snapshot.account ? discoveryError.message : null
  return { ...snapshot, error: snapshot.error ?? activeDiscoveryError, connecting: snapshot.status === 'connecting' || snapshot.status === 'switching-network', isRobinhood: snapshot.chainId === 4663, ownedFriends: connected && loadedAccount === snapshot.account ? ownedFriends : [], loadingFriends, signedIn: connected && signedAccount === snapshot.account, rfBalance: connected ? rfBalance : '0', connect, signIn, switchNetwork: session.switchNetwork, disconnect }
}
