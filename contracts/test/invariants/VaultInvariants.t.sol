// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {StdInvariant} from "forge-std/StdInvariant.sol";
import {GoodSaveVault} from "../../src/GoodSaveVault.sol";
import {MockGoodDollar} from "../../src/mocks/MockGoodDollar.sol";

contract VaultInvariants is StdInvariant, Test {
    GoodSaveVault public vault;
    MockGoodDollar public gDollar;

    function setUp() public {
        gDollar = new MockGoodDollar();
        vault = new GoodSaveVault(address(gDollar), "GS", "GS", 30 days, type(uint256).max, type(uint256).max);
        
        gDollar.mint(address(this), 1_000_000 ether);
        gDollar.approve(address(vault), type(uint256).max);

        targetContract(address(vault));
    }

    // Standard ERC4626 invariant: totalAssets must never be less than totalSupply for a 1:1 base setup without losses
    function invariant_totalAssetsAlwaysGteTotalSupply() public view {
        assertGe(vault.totalAssets(), vault.totalSupply());
    }

    // Shares should never exceed the asset balance of the vault (assuming no losses)
    function invariant_vaultBalanceGteTotalSupply() public view {
        assertGe(gDollar.balanceOf(address(vault)), vault.totalSupply());
    }
}
