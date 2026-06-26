// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console2} from "forge-std/Test.sol";
import {GoodSaveVault} from "../src/GoodSaveVault.sol";
import {GoodSaveStream} from "../src/GoodSaveStream.sol";
import {MockGoodDollar} from "../src/mocks/MockGoodDollar.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract GoodSaveVaultTest is Test {
    GoodSaveVault public vault;
    GoodSaveStream public stream;
    MockGoodDollar public gDollar;

    address public admin = address(1);
    address public alice = address(2);
    address public bob = address(3);

    uint256 public constant LOCK_DURATION = 30 days;
    uint256 public constant GLOBAL_CAP = 100_000 ether;
    uint256 public constant USER_CAP = 10_000 ether;

    function setUp() public {
        vm.startPrank(admin);
        
        gDollar = new MockGoodDollar();
        stream = new GoodSaveStream(address(gDollar));
        
        vault = new GoodSaveVault(
            address(gDollar),
            "GoodSave G$",
            "gsG$",
            LOCK_DURATION,
            GLOBAL_CAP
        );

        vault.setYieldStream(address(stream));
        stream.setVault(address(vault));
        
        gDollar.mint(alice, 50_000 ether);
        gDollar.mint(bob, 50_000 ether);
        gDollar.mint(admin, 100_000 ether);

        vm.stopPrank();
    }

    function test_Deposit() public {
        vm.startPrank(alice);
        gDollar.approve(address(vault), 1000 ether);
        uint256 shares = vault.deposit(1000 ether, alice);
        vm.stopPrank();

        assertEq(shares, 1000 ether);
        assertEq(vault.balanceOf(alice), 1000 ether);
        assertEq(gDollar.balanceOf(address(vault)), 1000 ether);
    }

    function test_DepositWithTransferAndCall() public {
        vm.startPrank(alice);
        // ERC677 deposit bypasses approve
        gDollar.transferAndCall(address(vault), 1000 ether, "");
        vm.stopPrank();

        assertEq(vault.balanceOf(alice), 1000 ether);
        assertEq(gDollar.balanceOf(address(vault)), 1000 ether);
    }

    function test_EarlyWithdrawalForfeitsYield() public {
        // Setup a stream
        vm.startPrank(admin);
        gDollar.approve(address(stream), 10_000 ether);
        stream.configureStream(30 days, 10_000 ether);
        vm.stopPrank();

        vm.startPrank(alice);
        gDollar.approve(address(vault), 1000 ether);
        vault.deposit(1000 ether, alice);
        vm.stopPrank();

        // Fast forward 15 days, stream is 50% unlocked (5,000 ether)
        vm.warp(block.timestamp + 15 days);
        
        uint256 aliceBalBefore = gDollar.balanceOf(alice);
        
        // Alice withdraws early
        vm.startPrank(alice);
        vault.earlyWithdraw();
        vm.stopPrank();

        uint256 aliceBalAfter = gDollar.balanceOf(alice);
        
        // She only gets her principal back (1000 ether)
        assertEq(aliceBalAfter - aliceBalBefore, 1000 ether);
        assertEq(vault.balanceOf(alice), 0);
        
        // The yield stays in the vault (or stream)
        assertEq(gDollar.balanceOf(address(vault)), 5000 ether);
    }

    function test_RedeemAtMaturityWithYield() public {
        // Setup a stream
        vm.startPrank(admin);
        gDollar.approve(address(stream), 10_000 ether);
        stream.configureStream(30 days, 10_000 ether);
        vm.stopPrank();

        vm.startPrank(alice);
        gDollar.approve(address(vault), 1000 ether);
        vault.deposit(1000 ether, alice);
        vm.stopPrank();

        // Fast forward past maturity (30 days)
        vm.warp(block.timestamp + 30 days);
        
        uint256 aliceBalBefore = gDollar.balanceOf(alice);
        
        vm.startPrank(alice);
        vault.redeem(1000 ether, alice, alice);
        vm.stopPrank();

        uint256 aliceBalAfter = gDollar.balanceOf(alice);
        
        // Alice gets principal + 10_000 ether yield
        assertApproxEqAbs(aliceBalAfter - aliceBalBefore, 11_000 ether, 100);
    }

    function testRevert_RedeemBeforeMaturity() public {
        vm.startPrank(alice);
        gDollar.approve(address(vault), 1000 ether);
        vault.deposit(1000 ether, alice);
        
        vm.expectRevert("Vault is locked. Use earlyWithdraw()");
        vault.redeem(1000 ether, alice, alice);
        vm.stopPrank();
    }
}
