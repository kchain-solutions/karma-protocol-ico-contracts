// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "./GLDKRC20.sol";

contract InvestorVault is ReentrancyGuard {
    

    /**
     * EVENTS 
     */
    event Bought(
        address indexed beneficiary,
        address stablecoinAddress,
        uint256 stablecoinAmount,
        uint256 _gldkrmAmount
    );

    event Withdrawal(
        address index beneficiary,
        address stablecoinAddress,
        uint256 stablecoinAmount
    )


    /**
     * STATE VARIABLES
     */
    mapping(address => bool) admins;
    mapping(address => bool) authorizedStablecoins
    mapping(address => uin256) stablecoinBalances;
    IERC20 public gldkrc20;
    uint256 public rate = 2; // Conversion rate for buying GLDKRC20 with Stablecoin
    

    constructor(
        IERC20 _gldkrc20,
        uint256 _rate,
    ) {
        require(_rate > 0, "Rate must be greater than 0");
        gldkrc20 = _gldkrc20;
        rate = _rate;
        admin[msg.sender] = true
    }


    /**
     *  FUNCTIONS & MODIFIERS
     */
    modifier onlyAdmins() {
        require(admins[msg.sender] == true, "Not an admin");
        _;
    }


    function addAdmin(address admin) external onlyAdmins{
        require(admin != address(0), "Invalid address");
        require(!admins[admin], "Already an admin");
        admins[admin] = true;
    }


    function addStablecoin(address _stablecoinAddress) external onlyAdmins{
        require(_stablecoinAddress != address(0), "Invalid address");
        authorizedStablecoins[_stablecoinAddress] = true;
        stablecoinBalances[_stablecoinAddress] = 0;
    }


    function removeStablecoin(address _stablecoinAddress) external onlyAdmins{
        require(_stablecoinAddress != address(0), "Invalid address");
        require(stablecoinBalances[_stablecoinAddress] == 0, "Stablecoin balance should be zero");
        authorizedStablecoins[_stablecoinAddress] = false;
    }

    function buy(uint256 _gldkrmAmount, address _stablecoinAddress) public nonReentrant {
        uint256 balance = _stablecoinAddress.balanceOf(msg.sender);
        require(balance >= _gldkrmAmount, "Not enough GLDKRM available");
        uint256 stableCoinAmount = _gldkrmAmount * rate; // Calculate the GLDKRC20 amount based on the rate
        uint256 GLDKRC20Balance = gldkrc20.balanceOf(address(this));
        require(
            GLDKRC20Balance >= GLDKRC20Amount,
            "Not enough GLDKRC20 tokens in contract"
        );
        ierc20.transferFrom(msg.sender, purchaseReceiver, _gldkrmAmount);
        gldkrc20.transfer(msg.sender, GLDKRC20Amount);
        emit Bought(msg.sender, _gldkrmAmount, GLDKRC20Amount);
    }


    function Withdrawal(uint256 amount, address stablecoinAddress) external onlyAdmins{

    }
}
