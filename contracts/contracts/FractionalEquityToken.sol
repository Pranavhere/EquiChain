// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FractionalEquityToken
 * @dev ERC-20 token representing fractional ownership of MRF shares
 * @notice This token uses 18 decimals to allow micro-fractions (e.g., ₹1 investments)
 */
contract FractionalEquityToken is ERC20, Ownable {
    address public marketContract;
    
    event MarketContractUpdated(address indexed oldMarket, address indexed newMarket);
    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);
    
    /**
     * @dev Constructor sets token name and symbol
     * @notice Initializes with "MRF Fractional Token" and symbol "MRFf"
     */
    constructor() ERC20("MRF Fractional Token", "MRFf") Ownable(msg.sender) {
        // Token starts with 0 supply; minted on-demand via market contract
    }
    
    /**
     * @dev Sets the market contract address that can mint/burn tokens
     * @param _marketContract Address of the EquiChainMarket contract
     */
    function setMarketContract(address _marketContract) external onlyOwner {
        require(_marketContract != address(0), "Invalid market contract address");
        address oldMarket = marketContract;
        marketContract = _marketContract;
        emit MarketContractUpdated(oldMarket, _marketContract);
    }
    
    /**
     * @dev Mints new fractional tokens
     * @param to Address to receive the tokens
     * @param amount Amount of tokens to mint (in wei, 18 decimals)
     * @notice Only callable by market contract
     */
    function mint(address to, uint256 amount) external {
        require(msg.sender == marketContract || msg.sender == owner(), "Only market contract or owner can mint");
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0, "Amount must be greater than 0");
        
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }
    
    /**
     * @dev Burns fractional tokens
     * @param from Address to burn tokens from
     * @param amount Amount of tokens to burn (in wei, 18 decimals)
     * @notice Only callable by market contract
     */
    function burn(address from, uint256 amount) external {
        require(msg.sender == marketContract || msg.sender == owner(), "Only market contract or owner can burn");
        require(from != address(0), "Cannot burn from zero address");
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(from) >= amount, "Insufficient balance to burn");
        
        _burn(from, amount);
        emit TokensBurned(from, amount);
    }
    
    /**
     * @dev Returns the number of decimals (18 for precise fractions)
     */
    function decimals() public pure override returns (uint8) {
        return 18;
    }
}
