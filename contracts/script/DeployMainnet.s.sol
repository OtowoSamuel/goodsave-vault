// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {GoodSaveVault} from "../src/GoodSaveVault.sol";
import {GoodSaveStrategy} from "../src/GoodSaveStrategy.sol";
import {GoodSaveStream} from "../src/GoodSaveStream.sol";

/**
 * @title DeployMainnet
 * @dev Celo mainnet deployment script using real protocol addresses.
 *
 * Env vars (optional overrides):
 * - PRIVATE_KEY (required)
 * - GDOLLAR_ADDRESS (default: mainnet G$)
 * - QUOTE_TOKEN_ADDRESS (default: cUSD)
 * - SWAP_ROUTER_ADDRESS (default: Uni v3 router used in integration tests)
 * - AAVE_POOL_ADDRESS (default: Aave v3 pool used in integration tests)
 * - GLOBAL_DEPOSIT_CAP (default: 100_000 ether)
 * - USER_DEPOSIT_CAP (default: 10_000 ether)
 */
contract DeployMainnet is Script {
    address internal constant DEFAULT_GDOLLAR = 0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A;
    address internal constant DEFAULT_CUSD = 0x765DE816845861e75A25fCA122bb6898B8B1282a;
    address internal constant DEFAULT_AAVE_POOL = 0x3E59A31363E2ad014dcbc521c4a0d5757d9f3402;
    address internal constant DEFAULT_SWAP_ROUTER = 0x5615CDAb10dc425a742d643d949a7F474C01abc4;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        address gDollar = vm.envOr("GDOLLAR_ADDRESS", DEFAULT_GDOLLAR);
        address quoteToken = vm.envOr("QUOTE_TOKEN_ADDRESS", DEFAULT_CUSD);
        address swapRouter = vm.envOr("SWAP_ROUTER_ADDRESS", DEFAULT_SWAP_ROUTER);
        address aavePool = vm.envOr("AAVE_POOL_ADDRESS", DEFAULT_AAVE_POOL);

        uint256 globalCap = vm.envOr("GLOBAL_DEPOSIT_CAP", uint256(100_000 ether));
        uint256 userCap = vm.envOr("USER_DEPOSIT_CAP", uint256(10_000 ether));

        require(gDollar != address(0), "GDOLLAR_ADDRESS is zero");
        require(quoteToken != address(0), "QUOTE_TOKEN_ADDRESS is zero");
        require(swapRouter != address(0), "SWAP_ROUTER_ADDRESS is zero");
        require(aavePool != address(0), "AAVE_POOL_ADDRESS is zero");

        vm.startBroadcast(deployerPrivateKey);

        GoodSaveStream stream = new GoodSaveStream(gDollar);
        GoodSaveVault vault = new GoodSaveVault(
            gDollar,
            "GoodSave G$",
            "gsG$",
            globalCap,
            userCap
        );
        GoodSaveStrategy strategy = new GoodSaveStrategy(gDollar, quoteToken, swapRouter, aavePool);

        stream.setVault(address(vault));
        vault.setYieldStream(address(stream));
        strategy.setVault(address(vault));

        vm.stopBroadcast();

        console2.log("Network: Celo Mainnet (42220)");
        console2.log("Deployer:", vm.addr(deployerPrivateKey));
        console2.log("GDollar:", gDollar);
        console2.log("Quote token:", quoteToken);
        console2.log("Swap router:", swapRouter);
        console2.log("Aave pool:", aavePool);
        console2.log("Global cap:", globalCap);
        console2.log("User cap:", userCap);
        console2.log("GoodSaveVault deployed at:", address(vault));
        console2.log("GoodSaveStream deployed at:", address(stream));
        console2.log("GoodSaveStrategy deployed at:", address(strategy));
    }
}
