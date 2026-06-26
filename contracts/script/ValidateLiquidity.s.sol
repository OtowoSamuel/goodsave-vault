// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";

interface IUniswapV3Factory {
    function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address);
}

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function decimals() external view returns (uint8);
    function symbol() external view returns (string memory);
}

/**
 * @title ValidateLiquidity
 * @dev Script to programmatically validate the liquidity depth of G$ pools on Celo mainnet.
 * Run with: forge script script/ValidateLiquidity.s.sol --rpc-url https://forno.celo.org
 */
contract ValidateLiquidity is Script {
    address constant G_DOLLAR = 0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A;
    address constant CUSD = 0x765DE816845861e75A25fCA122bb6898B8B1282a;
    address constant USDGLO = 0x4F604735c1cF31399C6E711D5962b2B3E0225AD3;
    
    address constant UNI_V3_FACTORY = 0xAfE208a311B21f13EF87E33A90049fC17A7acDEc;

    function run() external {
        console2.log("=== Checking G$ Liquidity on Uniswap V3 ===");
        
        _checkPool(G_DOLLAR, CUSD, 500);   // 0.05%
        _checkPool(G_DOLLAR, CUSD, 3000);  // 0.3%
        _checkPool(G_DOLLAR, CUSD, 10000); // 1%

        console2.log("\n=== Checking USDGLO/G$ Liquidity on Uniswap V3 ===");
        
        _checkPool(G_DOLLAR, USDGLO, 500);
        _checkPool(G_DOLLAR, USDGLO, 3000);
        _checkPool(G_DOLLAR, USDGLO, 10000);
    }

    function _checkPool(address tokenA, address tokenB, uint24 fee) internal {
        address pool = IUniswapV3Factory(UNI_V3_FACTORY).getPool(tokenA, tokenB, fee);
        if (pool == address(0)) {
            console2.log("Pool DOES NOT EXIST for fee", fee);
            return;
        }

        uint256 balA = IERC20(tokenA).balanceOf(pool);
        uint256 balB = IERC20(tokenB).balanceOf(pool);

        console2.log("Pool address: ", pool);
        console2.log("Fee: ", fee);
        console2.log("Reserve A: ", balA / (10**IERC20(tokenA).decimals()));
        console2.log("Reserve B: ", balB / (10**IERC20(tokenB).decimals()));
    }
}
