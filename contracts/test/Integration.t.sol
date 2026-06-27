// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console2} from "forge-std/Test.sol";
import {GoodSaveVault} from "../src/GoodSaveVault.sol";
import {GoodSaveStrategy} from "../src/GoodSaveStrategy.sol";
import {GoodSaveStream} from "../src/GoodSaveStream.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract IntegrationTest is Test {
    GoodSaveVault public vault;
    GoodSaveStrategy public strategy;
    GoodSaveStream public stream;
    
    // Celo Mainnet Addresses
    address constant GDOLLAR = 0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A;
    address constant CUSD = 0x765DE816845861e75A25fCA122bb6898B8B1282a;
    address constant AAVE_POOL = 0x3E59A31363E2ad014dcbc521c4a0d5757d9f3402;
    address constant UNI_ROUTER = 0x5615CDAb10dc425a742d643d949a7F474C01abc4;

    address public admin = address(1);
    address public user = address(2);

    function setUp() public {
        uint256 forkId = vm.createFork("https://forno.celo.org");
        vm.selectFork(forkId);

        vm.startPrank(admin);
        
        stream = new GoodSaveStream(GDOLLAR);
        vault = new GoodSaveVault(
            GDOLLAR,
            "GoodSave G$",
            "gsG$",
            30 days,
            100_000 ether
        );
        strategy = new GoodSaveStrategy(GDOLLAR, CUSD, UNI_ROUTER, AAVE_POOL);
        
        vault.setYieldStream(address(stream));
        stream.setVault(address(vault));
        strategy.setVault(address(vault));

        vm.stopPrank();
        
        // Fund user with G$ (deal directly from a whale)
        address gDollarWhale = 0x43d72Ff17701B2DA814620735C39C620Ce0ea4A1; // GoodDollar Reserve
        vm.prank(gDollarWhale);
        IERC20(GDOLLAR).transfer(user, 1000 ether);
    }

    function test_ForkDepositAndWithdraw() public {
        // User deposits
        vm.startPrank(user);
        IERC20(GDOLLAR).approve(address(vault), 500 ether);
        vault.deposit(500 ether, user);
        vm.stopPrank();

        assertEq(vault.balanceOf(user), 500 ether);

        // Fast forward
        vm.warp(block.timestamp + 31 days);

        // User redeems
        vm.startPrank(user);
        vault.redeem(500 ether, user, user);
        vm.stopPrank();

        assertApproxEqAbs(IERC20(GDOLLAR).balanceOf(user), 1000 ether, 50 ether);
    }
}
