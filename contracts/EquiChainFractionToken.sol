// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/*
 * EquiChain: Fractional Ownership Token
 * Mint on buy, Burn on sell (dynamic total supply)
 */

contract EquiChainFractionToken is ERC20, Ownable {

    constructor(
        string memory assetName,
        string memory assetSymbol
    ) ERC20(assetName, assetSymbol) Ownable(msg.sender) {}

    // Mint fractions when new investors buy in
    function mint(address to, uint256 units) external onlyOwner {
        _mint(to, units);
    }

    // Burn fractions when investors sell out
    function burn(address from, uint256 units) external onlyOwner {
        _burn(from, units);
    }
}
