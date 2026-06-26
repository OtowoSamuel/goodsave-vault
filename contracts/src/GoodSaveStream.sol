// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title GoodSaveStream
 * @dev A simple linear vesting contract that distributes grant funds to the vault over time.
 * Replaces Superfluid due to its absence on Celo.
 */
contract GoodSaveStream is AccessControl, Pausable {
    using SafeERC20 for IERC20;

    bytes32 public constant ADMIN_ROLE = DEFAULT_ADMIN_ROLE;

    IERC20 public immutable token;
    address public vault;

    uint256 public streamStart;
    uint256 public streamEnd;
    uint256 public totalStreamed;
    uint256 public amountClaimed;

    event StreamConfigured(uint256 start, uint256 end, uint256 totalAmount);
    event YieldInjected(uint256 amount);

    constructor(address _token) {
        token = IERC20(_token);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    function setVault(address _vault) external onlyRole(ADMIN_ROLE) {
        vault = _vault;
    }

    function pause() external onlyRole(ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(ADMIN_ROLE) { _unpause(); }

    function configureStream(uint256 _durationSeconds, uint256 _amount) external onlyRole(ADMIN_ROLE) {
        require(_durationSeconds > 0, "Invalid duration");
        
        token.safeTransferFrom(msg.sender, address(this), _amount);
        
        streamStart = block.timestamp;
        streamEnd = block.timestamp + _durationSeconds;
        totalStreamed = _amount;
        amountClaimed = 0;

        emit StreamConfigured(streamStart, streamEnd, _amount);
    }

    function claimYield() external whenNotPaused returns (uint256) {
        require(msg.sender == vault, "Only vault");
        if (block.timestamp <= streamStart) return 0;
        
        uint256 claimable = _calculateClaimable();
        if (claimable == 0) return 0;

        amountClaimed += claimable;
        token.safeTransfer(vault, claimable);

        emit YieldInjected(claimable);
        return claimable;
    }

    function _calculateClaimable() internal view returns (uint256) {
        if (block.timestamp >= streamEnd) {
            return totalStreamed - amountClaimed;
        }
        
        uint256 timePassed = block.timestamp - streamStart;
        uint256 duration = streamEnd - streamStart;
        uint256 expectedClaimed = (totalStreamed * timePassed) / duration;
        
        return expectedClaimed - amountClaimed;
    }
}
