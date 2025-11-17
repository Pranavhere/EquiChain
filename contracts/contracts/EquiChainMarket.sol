// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./FractionalEquityToken.sol";

/**
 * @title EquiChainMarket
 * @dev Market contract for buying and selling fractional equity tokens
 * @notice Simulates MRF stock priced at ₹1,00,000 per share
 */
contract EquiChainMarket {
    FractionalEquityToken public fractionToken;
    
    // Price of one whole MRF share in paise (₹1,00,000 = 10,000,000 paise)
    uint256 public pricePerWholeShareInPaise;
    
    // Events
    event FractionsPurchased(
        address indexed buyer,
        uint256 amountInPaise,
        uint256 tokensReceived,
        uint256 timestamp
    );
    
    event FractionsSold(
        address indexed seller,
        uint256 tokensSold,
        uint256 amountInPaise,
        uint256 timestamp
    );
    
    event PriceUpdated(uint256 oldPrice, uint256 newPrice);
    
    /**
     * @dev Constructor initializes the market with token and price
     * @param _fractionToken Address of the FractionalEquityToken contract
     * @param _pricePerWholeShareInPaise Initial price of one whole share in paise
     */
    constructor(address _fractionToken, uint256 _pricePerWholeShareInPaise) {
        require(_fractionToken != address(0), "Invalid token address");
        require(_pricePerWholeShareInPaise > 0, "Price must be greater than 0");
        
        fractionToken = FractionalEquityToken(_fractionToken);
        pricePerWholeShareInPaise = _pricePerWholeShareInPaise;
    }
    
    /**
     * @dev Buy fractional tokens with INR (simulated)
     * @param buyer Address of the buyer
     * @param amountInPaise Amount in paise to invest (e.g., ₹100 = 10,000 paise)
     * @return tokensToMint Amount of fractional tokens minted
     * 
     * @notice Calculation: 
     * If 1 whole share = 10,000,000 paise = 1e18 tokens (18 decimals)
     * Then investing X paise = (X * 1e18) / pricePerWholeShareInPaise tokens
     */
    function buyFractions(address buyer, uint256 amountInPaise) external returns (uint256) {
        require(buyer != address(0), "Invalid buyer address");
        require(amountInPaise > 0, "Amount must be greater than 0");
        
        // Calculate tokens to mint
        // Formula: tokensToMint = (amountInPaise * 10^18) / pricePerWholeShareInPaise
        uint256 tokensToMint = (amountInPaise * 1e18) / pricePerWholeShareInPaise;
        
        require(tokensToMint > 0, "Amount too small to buy fractional tokens");
        
        // Mint tokens to buyer
        fractionToken.mint(buyer, tokensToMint);
        
        emit FractionsPurchased(buyer, amountInPaise, tokensToMint, block.timestamp);
        
        return tokensToMint;
    }
    
    /**
     * @dev Sell fractional tokens for INR (simulated)
     * @param seller Address of the seller
     * @param tokenAmount Amount of fractional tokens to sell
     * @return amountInPaise Amount in paise to be returned
     * 
     * @notice Calculation:
     * If selling Y tokens, INR = (Y * pricePerWholeShareInPaise) / 1e18
     */
    function sellFractions(address seller, uint256 tokenAmount) external returns (uint256) {
        require(seller != address(0), "Invalid seller address");
        require(tokenAmount > 0, "Token amount must be greater than 0");
        require(fractionToken.balanceOf(seller) >= tokenAmount, "Insufficient token balance");
        
        // Calculate INR to return
        // Formula: amountInPaise = (tokenAmount * pricePerWholeShareInPaise) / 10^18
        uint256 amountInPaise = (tokenAmount * pricePerWholeShareInPaise) / 1e18;
        
        require(amountInPaise > 0, "Token amount too small to sell");
        
        // Burn tokens from seller
        fractionToken.burn(seller, tokenAmount);
        
        emit FractionsSold(seller, tokenAmount, amountInPaise, block.timestamp);
        
        return amountInPaise;
    }
    
    /**
     * @dev Update the price per whole share (owner/admin function)
     * @param newPriceInPaise New price in paise
     * @notice In production, this could be updated via oracle or governance
     */
    function updatePrice(uint256 newPriceInPaise) external {
        require(newPriceInPaise > 0, "Price must be greater than 0");
        
        uint256 oldPrice = pricePerWholeShareInPaise;
        pricePerWholeShareInPaise = newPriceInPaise;
        
        emit PriceUpdated(oldPrice, newPriceInPaise);
    }
    
    /**
     * @dev Get current price per whole share
     * @return Current price in paise
     */
    function getCurrentPrice() external view returns (uint256) {
        return pricePerWholeShareInPaise;
    }
    
    /**
     * @dev Calculate tokens for a given INR amount
     * @param amountInPaise Amount in paise
     * @return Estimated tokens to receive
     */
    function calculateTokensForAmount(uint256 amountInPaise) external view returns (uint256) {
        if (amountInPaise == 0) return 0;
        return (amountInPaise * 1e18) / pricePerWholeShareInPaise;
    }
    
    /**
     * @dev Calculate INR value for a given token amount
     * @param tokenAmount Amount of tokens
     * @return Estimated INR in paise
     */
    function calculateAmountForTokens(uint256 tokenAmount) external view returns (uint256) {
        if (tokenAmount == 0) return 0;
        return (tokenAmount * pricePerWholeShareInPaise) / 1e18;
    }
}
