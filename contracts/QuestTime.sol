// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract QuestTime {
    string public name = "QuestTime Avalanche Contract";

    function ping() public pure returns (string memory) {
        return "Connected to Avalanche!";
    }
}