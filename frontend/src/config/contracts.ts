import vaultJson from '../abis/GoodSaveVault.json';
import gDollarJson from '../abis/MockGoodDollar.json';
import type { Abi } from 'viem';

export const vaultAbi = vaultJson.abi as Abi;
export const gDollarAbi = gDollarJson.abi as Abi;

// Contract addresses loaded from environment variables.
// Set VITE_VAULT_ADDRESS and VITE_GDOLLAR_ADDRESS in your .env file.
// Defaults point at the live Celo mainnet deployment.
export const VAULT_ADDRESS = import.meta.env.VITE_VAULT_ADDRESS || "0x5Abcba0F71915a15ae0b2C437F0BC2c503568349";
export const GDOLLAR_ADDRESS = import.meta.env.VITE_GDOLLAR_ADDRESS || "0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A";
