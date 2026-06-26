// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC4626} from "@openzeppelin/contracts/interfaces/IERC4626.sol";

/**
 * @dev Interface of the ERC7540 standard as defined in the EIP.
 * This is a minimal interface covering the async redeem flow for a fixed-term vault.
 */
interface IERC7540 is IERC4626 {
    /**
     * @dev Emitted when a redeem request is made.
     */
    event RedeemRequest(address indexed controller, address indexed owner, uint256 requestId, address sender, uint256 shares);

    /**
     * @dev Requests the redemption of `shares` from the vault.
     * The shares are locked until the claim is processed.
     */
    function requestRedeem(uint256 shares, address controller, address owner) external returns (uint256 requestId);

    /**
     * @dev Returns the amount of shares that are pending for redemption.
     */
    function pendingRedeemRequest(address controller) external view returns (uint256 shares);

    /**
     * @dev Returns the amount of shares that are claimable (maturity reached).
     */
    function claimableRedeemRequest(address controller) external view returns (uint256 shares);
}
