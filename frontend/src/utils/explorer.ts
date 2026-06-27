const EXPLORER_MAP: Record<number, { name: string; url: string }> = {
  42220:    { name: 'Celoscan', url: 'https://celoscan.io' },
  11142220: { name: 'Celoscan', url: 'https://alfajores.celoscan.io' },
  44787:    { name: 'Celoscan', url: 'https://alfajores.celoscan.io' },
  1:        { name: 'Etherscan', url: 'https://etherscan.io' },
  31337:    { name: 'Local', url: 'http://localhost:8545' },
}

const FALLBACK = { name: 'Etherscan', url: 'https://etherscan.io' }

export function getExplorer(chainId?: number) {
  if (!chainId) return FALLBACK
  return EXPLORER_MAP[chainId] ?? FALLBACK
}

export function explorerAddressUrl(chainId: number | undefined, address: string) {
  return `${getExplorer(chainId).url}/address/${address}`
}

export function explorerTxUrl(chainId: number | undefined, txHash: string) {
  return `${getExplorer(chainId).url}/tx/${txHash}`
}
