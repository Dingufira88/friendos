import { useCallback, useEffect, useState } from 'react'

const ROBINHOOD_CHAIN_ID = '0x1237'
const ROBINHOOD_CHAIN = {
  chainId: ROBINHOOD_CHAIN_ID,
  chainName: 'Robinhood Chain',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: ['https://rpc.mainnet.chain.robinhood.com'],
  blockExplorerUrls: ['https://robinhoodchain.blockscout.com'],
}

type EthereumProvider = {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>
  on?(event: string, listener: (...args: unknown[]) => void): void
  removeListener?(event: string, listener: (...args: unknown[]) => void): void
}

declare global { interface Window { ethereum?: EthereumProvider } }

export function useWallet() {
  const [account, setAccount] = useState<string | null>(null)
  const [chainId, setChainId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)

  const sync = useCallback(async () => {
    if (!window.ethereum) return
    const [accounts, chain] = await Promise.all([
      window.ethereum.request({ method: 'eth_accounts' }) as Promise<string[]>,
      window.ethereum.request({ method: 'eth_chainId' }) as Promise<string>,
    ])
    setAccount(accounts[0] ?? null)
    setChainId(chain)
  }, [])

  useEffect(() => {
    void sync()
    const update = () => void sync()
    window.ethereum?.on?.('accountsChanged', update)
    window.ethereum?.on?.('chainChanged', update)
    return () => {
      window.ethereum?.removeListener?.('accountsChanged', update)
      window.ethereum?.removeListener?.('chainChanged', update)
    }
  }, [sync])

  const connect = useCallback(async () => {
    if (!window.ethereum) { setError('Install a browser wallet to connect.'); return }
    setConnecting(true)
    setError(null)
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[]
      let currentChain = await window.ethereum.request({ method: 'eth_chainId' }) as string
      if (currentChain !== ROBINHOOD_CHAIN_ID) {
        try {
          await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: ROBINHOOD_CHAIN_ID }] })
        } catch (switchError) {
          if ((switchError as { code?: number }).code !== 4902) throw switchError
          await window.ethereum.request({ method: 'wallet_addEthereumChain', params: [ROBINHOOD_CHAIN] })
        }
        currentChain = ROBINHOOD_CHAIN_ID
      }
      setAccount(accounts[0] ?? null)
      setChainId(currentChain)
    } catch {
      setError('Wallet connection was cancelled or unavailable.')
    } finally {
      setConnecting(false)
    }
  }, [])

  return { account, chainId, error, connecting, isRobinhood: chainId === ROBINHOOD_CHAIN_ID, connect }
}
