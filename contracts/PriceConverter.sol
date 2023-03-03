// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConcerter {
    function getPrice(AggregatorV3Interface priceFeed) internal view returns(uint) {
        // address: 0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e
        // ABI from chainlink interface import
        (,int price,,,) = priceFeed.latestRoundData();
        return uint(price * 1e10);
    }

    function getExchangeRate(uint eth, AggregatorV3Interface priceFeed) internal view returns(uint) {
        uint ethValueInUsd = getPrice(priceFeed);
        uint usd = (ethValueInUsd * eth) / 1e18;
        return usd;
    }
}