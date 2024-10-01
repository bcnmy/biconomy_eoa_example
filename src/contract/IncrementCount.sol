// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

//Amoy address - 0xcf29227477393728935BdBB86770f8F81b698F1A

contract Counter {
    uint256 private count;

    constructor() {
        count = 0;
    }

    // Function to increment the counter only if the sent value is >= 1 ether
    function increment() public payable {
        require(msg.value >= 1 ether, "You must send at least 1 ether to increment.");
        count++;
    }

    function getCount() public view returns (uint256) {
        return count;
    }
}
