// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";


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
        address indexed beneficiary,
        address stablecoinAddress,
        uint256 stablecoinAmount
    );


    /**
     * STATE VARIABLES
     */
    mapping(address => bool) admins;
    mapping(address => bool) authorizedStablecoins;
    mapping(address => uin256) stablecoinBalances;
    IERC20 public gldkrm20;
    uint256 public rate = 12; // Conversion rate for buying gldkrm20 with Stablecoin
    

    constructor(
        IERC20 _gldkrm20,
        uint256 _rate
    ) {
        require(_rate > 0, "Rate must be greater than 0");
        gldkrm20 = _gldkrm20;
        rate = _rate;
        admin[msg.sender] = true;
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


    function removeStablecoin(ierc20 _stablecoinAddress) external onlyAdmins{
        require(_stablecoinAddress != address(0), "Invalid address");
        require(stablecoinBalances[_stablecoinAddress] == 0, "Stablecoin balance should be zero");
        authorizedStablecoins[_stablecoinAddress] = false;
    }

    function buy(uint256 _amount, ierc20 _stablecoinAddress) public nonReentrant {
        require(authorizedStablecoins[_stablecoinAddress] == true, "Stablecoin not registered");
        require(_stablecoinAddress != address(0), "Invalid address");

        uint256 userStablecoinBalance = _stablecoinAddress.balanceOf(msg.sender);
        require(userStablecoinBalance >= _amount, "Insufficient amount");

        uint256 gldkarmaAmount = _amount * rate;
        uint256 gldkrm20Balance = gldkrm20.balanceOf(address(this));
        require(gldkrm20Balance >= gldkarmaAmount, "Not enough GLDKRM available");
        
        _stablecoinAddress.transferFrom(msg.sender, address(this), _gldkrmAmount);
        stablecoinBalances[_stablecoinAddress] = stablecoinBalances[_stablecoinAddress] + gldkarmaAmount;
        gldkrm20.transfer(msg.sender, gldkarmaAmount);

        emit Bought(msg.sender, _gldkrmAmount, gldkrm20Amount);
    }


    function withdrawal(uint256 amount, ierc20 _stablecoinAddress) external onlyAdmins nonReentrant{
        require(_stablecoinAddress != address(0), "Invalid address");
        require(stablecoinBalances[_stablecoinAddress] >= amount, "Insufficient amount");
        
        stablecoinBalances[_stablecoinAddress] = stablecoinBalances[_stablecoinAddress] - amount;
        stablecoinBalances[_stablecoinAddress].transfer(msg.sender, amount);

        emit Withdrawal(msg.sender, _stablecoinAddress, amount);
    }


    function selfDestruct () external onlyAdmins{
        selfdestruct(payable(msg.sender));
    }
}
