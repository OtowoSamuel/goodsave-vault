// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {Script, console2} from "forge-std/Script.sol";
import {GoodSaveVault} from "../src/GoodSaveVault.sol";
import {GoodSaveStrategy} from "../src/GoodSaveStrategy.sol";
import {GoodSaveStream} from "../src/GoodSaveStream.sol";
import {MockGoodDollar} from "../src/mocks/MockGoodDollar.sol";

contract DeployLocal is Script {
    function run() external {
        vm.startBroadcast();

        MockGoodDollar gDollarMock = new MockGoodDollar();
        MockGoodDollar cUsdMock = new MockGoodDollar(); // Reusing mock
        
        GoodSaveStream stream = new GoodSaveStream(address(gDollarMock));
        GoodSaveVault vault = new GoodSaveVault(
            address(gDollarMock),
            "GoodSave G$",
            "gsG$",
            100_000 ether,
            10_000 ether
        );
        // Using address(0) for router and pool since it's local
        GoodSaveStrategy strategy = new GoodSaveStrategy(address(gDollarMock), address(cUsdMock), address(0), address(0));

        stream.setVault(address(vault));
        vault.setYieldStream(address(stream));
        strategy.setVault(address(vault));

        console2.log("GDollarMock deployed at:", address(gDollarMock));
        console2.log("GoodSaveVault deployed at:", address(vault));
        console2.log("GoodSaveStream deployed at:", address(stream));

        vm.stopBroadcast();
    }
}
