// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ISwapRouter} from "./interfaces/ISwapRouter.sol";
import {IAaveV3Pool} from "./interfaces/IAaveV3Pool.sol";

/**
 * @title GoodSaveStrategy
 * @dev Manages G$ to USDm swaps via Uniswap V3, and deposits to Aave V3.
 */
contract GoodSaveStrategy is AccessControl, Pausable {
    using SafeERC20 for IERC20;

    bytes32 public constant STRATEGY_MANAGER_ROLE = keccak256("STRATEGY_MANAGER_ROLE");

    IERC20 public immutable gDollar;
    IERC20 public immutable usdm;
    ISwapRouter public immutable swapRouter;
    IAaveV3Pool public immutable aavePool;
    address public vault;

    constructor(address _gDollar, address _usdm, address _swapRouter, address _aavePool) {
        gDollar = IERC20(_gDollar);
        usdm = IERC20(_usdm);
        swapRouter = ISwapRouter(_swapRouter);
        aavePool = IAaveV3Pool(_aavePool);

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(STRATEGY_MANAGER_ROLE, msg.sender);
    }

    function setVault(address _vault) external onlyRole(DEFAULT_ADMIN_ROLE) {
        vault = _vault;
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) { _unpause(); }

    /**
     * @dev Swaps G$ for USDm via Uniswap V3 and deposits to Aave.
     * Called manually by STRATEGY_MANAGER_ROLE due to low DEX liquidity.
     */
    function swapAndDeposit(uint256 amountIn, uint256 amountOutMin, uint24 feeTier) external onlyRole(STRATEGY_MANAGER_ROLE) whenNotPaused {
        gDollar.safeTransferFrom(vault, address(this), amountIn);
        gDollar.forceApprove(address(swapRouter), amountIn);

        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
            tokenIn: address(gDollar),
            tokenOut: address(usdm),
            fee: feeTier,
            recipient: address(this),
            amountIn: amountIn,
            amountOutMinimum: amountOutMin,
            sqrtPriceLimitX96: 0
        });

        uint256 amountOut = swapRouter.exactInputSingle(params);

        usdm.forceApprove(address(aavePool), amountOut);
        aavePool.supply(address(usdm), amountOut, address(this), 0);
    }

    /**
     * @dev Withdraws USDm from Aave, swaps to G$, and returns to Vault.
     */
    function withdrawAndSwap(uint256 amountUsdmToWithdraw, uint256 amountGMin, uint24 feeTier) external onlyRole(STRATEGY_MANAGER_ROLE) whenNotPaused {
        uint256 withdrawn = aavePool.withdraw(address(usdm), amountUsdmToWithdraw, address(this));

        usdm.forceApprove(address(swapRouter), withdrawn);

        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
            tokenIn: address(usdm),
            tokenOut: address(gDollar),
            fee: feeTier,
            recipient: vault,
            amountIn: withdrawn,
            amountOutMinimum: amountGMin,
            sqrtPriceLimitX96: 0
        });

        swapRouter.exactInputSingle(params);
    }

    // Recover stray tokens
    function recoverToken(address token, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        IERC20(token).safeTransfer(msg.sender, amount);
    }
}
