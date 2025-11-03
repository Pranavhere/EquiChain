// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/*
 * Fractional Equity Pool
 * Users deposit money -> receive fractional units based on NAV
 */

contract EquiChainEquityPool is ERC20, Ownable {
    uint256 public sharePrice;       // Simulated real equity price (set via oracle/admin)
    uint256 public sharesHeld;       // Total whole shares fund owns
    uint256 public cashReserve;      // Extra INR/ETH liquidity

    constructor() ERC20("EquiChain Equity Fraction", "EQF") Ownable(msg.sender) {}

    function setSharePrice(uint256 price) external onlyOwner {
        sharePrice = price;
    }

    function poolValue() public view returns (uint256) {
        return sharesHeld * sharePrice + cashReserve;
    }

    function nav() public view returns (uint256) {
        uint256 supply = totalSupply();
        return supply == 0 ? sharePrice : poolValue() / supply;
    }

    function invest() external payable {
        require(msg.value > 0, "Send ETH to invest");
        uint256 tokens = msg.value / nav();
        _mint(msg.sender, tokens);
        cashReserve += msg.value;
    }

    function redeem(uint256 tokens) external {
        require(balanceOf(msg.sender) >= tokens, "Insufficient tokens");
        uint256 ethAmount = tokens * nav();
        _burn(msg.sender, tokens);
        cashReserve -= ethAmount;
        payable(msg.sender).transfer(ethAmount);
    }
}
