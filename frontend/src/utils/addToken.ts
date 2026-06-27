type WatchAssetParams = {
  address: string
  symbol: string
  decimals: number
  image?: string
}

/** EIP-747: prompt the user's wallet to add an ERC-20 token. Returns true if accepted. */
export async function addTokenToWallet(params: WatchAssetParams): Promise<boolean> {
  try {
    const eth = (window as unknown as { ethereum?: { request: (a: unknown) => Promise<unknown> } }).ethereum
    if (!eth?.request) return false
    const result = await eth.request({
      method: 'wallet_watchAsset',
      params: { type: 'ERC20', options: params },
    })
    return Boolean(result)
  } catch {
    return false
  }
}
