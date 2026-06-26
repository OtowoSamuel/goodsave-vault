import vaultJson from '../abis/GoodSaveVault.json';
import gDollarJson from '../abis/MockGoodDollar.json';
import type { Abi } from 'viem';

export const vaultAbi = vaultJson.abi as Abi;
export const gDollarAbi = gDollarJson.abi as Abi;

// Contract addresses loaded from environment variables.
// Set VITE_VAULT_ADDRESS and VITE_GDOLLAR_ADDRESS in your .env file.
// Defaults are deterministic Anvil addresses from DeployLocal.s.sol.
export const VAULT_ADDRESS = import.meta.env.VITE_VAULT_ADDRESS || "0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0";
export const GDOLLAR_ADDRESS = import.meta.env.VITE_GDOLLAR_ADDRESS || "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318";
