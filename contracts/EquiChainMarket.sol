// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./EquiChainFractionToken.sol";

contract EquiChainMarket {

    EquiChainFractionToken public token;

    uint256 public totalPortfolioValue; 
    uint256 public totalTokensSupply; 

    constructor(address tokenAddress) {
        token = EquiChainFractionToken(tokenAddress);
    }

    function getNAV() public view returns (uint256) {
        require(totalTokensSupply > 0, "No supply yet");
        return totalPortfolioValue * 1e18 / totalTokensSupply;
    }

    // Deposit ETH → Receive fractional tokens
    function deposit() public payable {
        require(msg.value > 0, "Send ETH");

        uint256 nav = totalTokensSupply == 0 ? 1e18 : getNAV();
        uint256 tokensToMint = msg.value * 1e18 / nav;

        token.mint(msg.sender, tokensToMint);

        totalPortfolioValue += msg.value;
        totalTokensSupply += tokensToMint;
    }

    // Redeem tokens → Receive ETH back
    function redeem(uint256 tokenAmount) public {
        require(tokenAmount > 0, "Enter amount");

        uint256 nav = getNAV();
        uint256 ethToReturn = tokenAmount * nav / 1e18;

        require(address(this).balance >= ethToReturn, "Not enough liquidity");

        token.burn(msg.sender, tokenAmount);

        totalPortfolioValue -= ethToReturn;
        totalTokensSupply -= tokenAmount;

        payable(msg.sender).transfer(ethToReturn);
    }

    receive() external payable {}
}
