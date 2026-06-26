// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console2} from "forge-std/Test.sol";
import {GoodSaveVault} from "../src/GoodSaveVault.sol";
import {GoodSaveStream} from "../src/GoodSaveStream.sol";
import {MockGoodDollar} from "../src/mocks/MockGoodDollar.sol";

contract GoodSaveVaultFuzzTest is Test {
    GoodSaveVault public vault;
    GoodSaveStream public stream;
    MockGoodDollar public gDollar;

    address public admin = address(1);
    address public alice = address(2);

    uint256 public constant LOCK_DURATION = 30 days;
    uint256 public constant GLOBAL_CAP = 1_000_000 ether;
    uint256 public constant USER_CAP = 100_000 ether;

    function setUp() public {
        vm.startPrank(admin);
        gDollar = new MockGoodDollar();
        stream = new GoodSaveStream(address(gDollar));
        vault = new GoodSaveVault(address(gDollar), "GS", "GS", LOCK_DURATION, GLOBAL_CAP, USER_CAP);
        vault.setYieldStream(address(stream));
        stream.setVault(address(vault));
        vm.stopPrank();
    }

    function testFuzz_Deposit(uint256 amount) public {
        vm.assume(amount > 0 && amount <= USER_CAP);
        
        gDollar.mint(alice, amount);
        
        vm.startPrank(alice);
        gDollar.approve(address(vault), amount);
        uint256 shares = vault.deposit(amount, alice);
        vm.stopPrank();

        assertEq(shares, amount);
        assertEq(vault.balanceOf(alice), amount);
        assertEq(gDollar.balanceOf(address(vault)), amount);
    }

    function testFuzz_EarlyWithdrawal(uint256 amount, uint256 timeForward) public {
        vm.assume(amount > 0 && amount <= USER_CAP);
        vm.assume(timeForward > 0 && timeForward < LOCK_DURATION); // Before maturity

        gDollar.mint(alice, amount);
        
        vm.startPrank(alice);
        gDollar.approve(address(vault), amount);
        vault.deposit(amount, alice);
        vm.stopPrank();

        vm.warp(block.timestamp + timeForward);
        
        uint256 aliceBalBefore = gDollar.balanceOf(alice);

        vm.startPrank(alice);
        vault.earlyWithdraw();
        vm.stopPrank();

        uint256 aliceBalAfter = gDollar.balanceOf(alice);
        
        // Forfeits yield, only gets principal back
        assertEq(aliceBalAfter - aliceBalBefore, amount);
        assertEq(vault.balanceOf(alice), 0);
    }
}
