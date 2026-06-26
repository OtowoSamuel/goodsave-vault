// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC4626} from "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC677Receiver} from "./interfaces/IERC677Receiver.sol";
import {IERC7540} from "./interfaces/IERC7540.sol";
import {IERC4626} from "@openzeppelin/contracts/interfaces/IERC4626.sol";
import {GoodSaveStream} from "./GoodSaveStream.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";

/**
 * @title GoodSaveVault
 * @dev ERC-4626 vault with fixed-term locks and early withdrawal penalties.
 *
 * Yield Policy: When a user early-withdraws, their forfeited yield remains in the vault
 * and accrues to remaining depositors via an increased share price. This is by design:
 * it rewards users who honor their lock commitment.
 */
contract GoodSaveVault is ERC4626, AccessControl, Pausable, ReentrancyGuard, IERC677Receiver, IERC7540 {
    using SafeERC20 for IERC20;

    bytes32 public constant ADMIN_ROLE = DEFAULT_ADMIN_ROLE;

    uint256 public globalDepositCap;
    uint256 public userDepositCap;
    GoodSaveStream public yieldStream;

    struct UserDepositInfo {
        uint256 lockedUntil;
        uint256 principalAssets;
        uint256 shares;
    }

    mapping(address => UserDepositInfo) public userInfos;

    // ERC-7540 Async Redeem tracking
    struct RedeemRequestInfo {
        uint256 shares;
        uint256 maturity;
    }
    mapping(address => RedeemRequestInfo) public redeemRequests;
    uint256 private _nextRequestId = 1;

    event EarlyWithdrawal(address indexed user, uint256 assetsReturned, uint256 yieldForfeited);
    event YieldStreamUpdated(address indexed streamAddress);
    event CapsUpdated(uint256 globalCap, uint256 userCap);

    constructor(
        address _asset,
        string memory _name,
        string memory _symbol,
        uint256 _globalCap,
        uint256 _userCap
    ) ERC4626(IERC20(_asset)) ERC20(_name, _symbol) {
        globalDepositCap = _globalCap;
        userDepositCap = _userCap;

        _grantRole(ADMIN_ROLE, msg.sender);
    }

    // --- Admin Functions --- //

    function setYieldStream(address _stream) external onlyRole(ADMIN_ROLE) {
        yieldStream = GoodSaveStream(_stream);
        emit YieldStreamUpdated(_stream);
    }

    function setCaps(uint256 _globalCap, uint256 _userCap) external onlyRole(ADMIN_ROLE) {
        globalDepositCap = _globalCap;
        userDepositCap = _userCap;
        emit CapsUpdated(_globalCap, _userCap);
    }

    function pause() external onlyRole(ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(ADMIN_ROLE) { _unpause(); }

    // Process incoming yield from the stream
    function pullYield() public {
        if (address(yieldStream) != address(0)) {
            yieldStream.claimYield();
        }
    }

    // --- Overrides for standard ERC4626 to enforce caps and non-transferability --- //

    function maxDeposit(address) public view override(ERC4626, IERC4626) returns (uint256) {
        if (paused()) return 0;
        uint256 total = totalAssets();
        if (total >= globalDepositCap) return 0;
        return globalDepositCap - total;
    }

    function _update(address from, address to, uint256 value) internal override {
        // Make shares non-transferable to prevent lock evasion
        require(from == address(0) || to == address(0), "Shares are non-transferable");
        super._update(from, to, value);
    }

    function deposit(uint256 assets, address receiver) public override(ERC4626, IERC4626) whenNotPaused nonReentrant returns (uint256) {
        return _depositWithDuration(assets, receiver, 30 days);
    }

    function depositWithDuration(uint256 assets, address receiver, uint256 duration) public whenNotPaused nonReentrant returns (uint256) {
        return _depositWithDuration(assets, receiver, duration);
    }

    function _depositWithDuration(uint256 assets, address receiver, uint256 duration) internal returns (uint256) {
        require(receiver == msg.sender, "Must deposit for self");
        require(assets <= maxDeposit(receiver), "Exceeds global cap");
        
        pullYield();

        UserDepositInfo storage info = userInfos[receiver];
        require(info.principalAssets + assets <= userDepositCap, "Exceeds user cap");

        uint256 shares = super.deposit(assets, receiver);

        // Update user deposit info
        info.principalAssets += assets;
        info.shares += shares;
        // Never move lockedUntil backwards — only extend if new deposit pushes further
        uint256 newLock = block.timestamp + duration;
        if (newLock > info.lockedUntil) {
            info.lockedUntil = newLock;
        }

        return shares;
    }

    // Mint is blocked for simplicity, use deposit
    function mint(uint256, address) public pure override(ERC4626, IERC4626) returns (uint256) {
        revert("Use deposit()");
    }

    function withdraw(uint256, address, address) public pure override(ERC4626, IERC4626) returns (uint256) {
        revert("Use redeem() or earlyWithdraw()");
    }

    function redeem(uint256 shares, address receiver, address owner) public override(ERC4626, IERC4626) nonReentrant returns (uint256) {
        require(receiver == owner, "Receiver must be owner");
        require(msg.sender == owner, "Sender must be owner");
        
        UserDepositInfo storage info = userInfos[owner];
        require(block.timestamp >= info.lockedUntil, "Vault is locked. Use earlyWithdraw()");
        require(info.shares >= shares, "Insufficient shares");

        pullYield();

        uint256 assets = super.redeem(shares, receiver, owner);
        
        // H-3 Fix: On full redeem, zero out directly to avoid rounding dust
        if (shares == info.shares) {
            info.principalAssets = 0;
            info.shares = 0;
        } else {
            uint256 principalToReduce = (info.principalAssets * shares) / info.shares;
            info.principalAssets -= principalToReduce;
            info.shares -= shares;
        }

        return assets;
    }

    /**
     * @dev Early withdrawal penalty logic. Forfeits all yield.
     * Forfeited yield remains in the vault, accruing to remaining holders via increased share price.
     */
    function earlyWithdraw() external nonReentrant returns (uint256) {
        address owner = msg.sender;
        UserDepositInfo storage info = userInfos[owner];
        require(info.shares > 0, "No shares");
        
        pullYield();

        uint256 sharesToBurn = info.shares;
        uint256 principal = info.principalAssets;
        
        uint256 assetValue = convertToAssets(sharesToBurn);
        uint256 assetsToReturn = assetValue > principal ? principal : assetValue;
        uint256 yieldForfeited = assetValue > principal ? assetValue - principal : 0;

        // Burn all shares internally without transferring out the yield
        _burn(owner, sharesToBurn);
        SafeERC20.safeTransfer(IERC20(asset()), owner, assetsToReturn);

        // Reset info
        info.principalAssets = 0;
        info.shares = 0;
        info.lockedUntil = 0;

        emit EarlyWithdrawal(owner, assetsToReturn, yieldForfeited);
        return assetsToReturn;
    }

    // --- IERC7540 Async Redeem Flow --- //

    function requestRedeem(uint256 shares, address controller, address owner) external override returns (uint256 requestId) {
        require(controller == owner && msg.sender == owner, "Must be owner");
        UserDepositInfo storage info = userInfos[owner];
        require(info.shares >= shares, "Insufficient shares");

        // M-1 Fix: Escrow shares by transferring them to the vault (burn from user, track in request)
        // We reduce user's tracked shares so they cannot double-spend via earlyWithdraw
        info.shares -= shares;

        RedeemRequestInfo storage req = redeemRequests[owner];
        req.shares += shares;
        req.maturity = info.lockedUntil; // Inherits the existing lock

        requestId = _nextRequestId++;
        emit RedeemRequest(controller, owner, requestId, msg.sender, shares);
        return requestId;
    }

    /// @notice Returns the number of request IDs issued so far
    function nextRequestId() external view returns (uint256) {
        return _nextRequestId;
    }

    function pendingRedeemRequest(address controller) external view override returns (uint256 shares) {
        RedeemRequestInfo memory req = redeemRequests[controller];
        if (block.timestamp < req.maturity) {
            return req.shares;
        }
        return 0;
    }

    function claimableRedeemRequest(address controller) external view override returns (uint256 shares) {
        RedeemRequestInfo memory req = redeemRequests[controller];
        if (block.timestamp >= req.maturity) {
            return req.shares;
        }
        return 0;
    }

    // --- IERC677 Receiver --- //

    function onTokenTransfer(address sender, uint256 value, bytes calldata data) external override whenNotPaused nonReentrant returns (bool) {
        require(msg.sender == asset(), "Only asset token");
        require(value <= maxDeposit(sender), "Exceeds global cap");

        uint256 duration = 30 days;
        if (data.length == 32) {
            duration = abi.decode(data, (uint256));
        }

        pullYield();

        UserDepositInfo storage info = userInfos[sender];
        require(info.principalAssets + value <= userDepositCap, "Exceeds user cap");

        uint256 assetsBefore = totalAssets() - value;
        uint256 shares = assetsBefore == 0 ? value : Math.mulDiv(value, totalSupply(), assetsBefore, Math.Rounding.Floor);
        _mint(sender, shares);

        info.principalAssets += value;
        info.shares += shares;
        
        uint256 newLock = block.timestamp + duration;
        if (newLock > info.lockedUntil) {
            info.lockedUntil = newLock;
        }

        emit Deposit(sender, sender, value, shares);
        return true;
    }
}
