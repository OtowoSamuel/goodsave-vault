// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {GoodSaveVault} from "../src/GoodSaveVault.sol";
import {GoodSaveStrategy} from "../src/GoodSaveStrategy.sol";
import {GoodSaveStream} from "../src/GoodSaveStream.sol";
import {MockGoodDollar} from "../src/mocks/MockGoodDollar.sol";

/**
 * @title Deploy
 * @dev Deployment script for testnet (Celo Sepolia / Alfajores).
 *      Deploys mock tokens since G$ does not exist on testnets at the same address.
 *      For mainnet, use DeployMainnet.s.sol with real token addresses.
 *
 * Usage:
 *      PRIVATE_KEY=0x... forge script script/Deploy.s.sol --broadcast --rpc-url celo_sepolia
 */
contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);

        // Deploy mock tokens for testnet
        MockGoodDollar gDollarMock = new MockGoodDollar();
        MockGoodDollar cUsdMock = new MockGoodDollar();

        GoodSaveStream stream = new GoodSaveStream(address(gDollarMock));
        GoodSaveVault vault = new GoodSaveVault(
            address(gDollarMock),
            "GoodSave G$",
            "gsG$",
            100_000 ether,
            10_000 ether
        );
        // Strategy with address(0) for router/pool on testnet — swap functions won't work
        // but vault + stream + deposit/withdraw are fully testable
        GoodSaveStrategy strategy = new GoodSaveStrategy(address(gDollarMock), address(cUsdMock), address(0), address(0));

        stream.setVault(address(vault));
        vault.setYieldStream(address(stream));
        strategy.setVault(address(vault));

        console2.log("MockGDollar deployed at:", address(gDollarMock));
        console2.log("GoodSaveVault deployed at:", address(vault));
        console2.log("GoodSaveStream deployed at:", address(stream));
        console2.log("GoodSaveStrategy deployed at:", address(strategy));

        vm.stopBroadcast();
    }
}
