// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./CurveAMM-old.sol";

contract CurveAMMFactory {
    address[] public allAMMs;
    mapping(address => mapping(address => address)) public getAMM;

    event AMMCreated(address indexed token1, address indexed token2, address amm);

    function createAMM(address token1, address token2) external returns (address amm) {
        require(token1 != token2, "Tokens must be different");
        require(token1 != address(0) && token2 != address(0), "Zero address not allowed");
        require(getAMM[token1][token2] == address(0), "AMM already exists");

        CurveAMM newAMM = new CurveAMM(token1, token2);
        amm = address(newAMM);
        getAMM[token1][token2] = amm;
        getAMM[token2][token1] = amm;
        allAMMs.push(amm);

        newAMM.transferOwnership(msg.sender);

        emit AMMCreated(token1, token2, amm);
    }

    function getAMMs() external view returns (address[] memory) {
        return allAMMs;
    }

    function allAMMsLength() external view returns (uint256) {
        return allAMMs.length;
    }
}
