// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC677Receiver} from "../interfaces/IERC677Receiver.sol";

contract MockGoodDollar is ERC20 {
    constructor() ERC20("GoodDollar", "G$") {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function transferAndCall(address to, uint256 value, bytes calldata data) external returns (bool) {
        transfer(to, value);
        require(IERC677Receiver(to).onTokenTransfer(msg.sender, value, data), "ERC677: transferAndCall failed");
        return true;
    }
}
