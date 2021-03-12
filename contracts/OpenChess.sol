// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "./ChessContent.sol";

contract OpenChess is Ownable {
    ChessContent public cc;

    constructor(address token) {
        cc = ChessContent(token);
    }

    function buy(uint256 id) public payable {
        cc.buy{ value: msg.value }(id, msg.sender);
    }
}
