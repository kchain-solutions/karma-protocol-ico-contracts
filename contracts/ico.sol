// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";


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
    mapping(address => uint256) stablecoinBalances;
    IERC20 public gldkrm20;
    uint256 public rate = 12; // Conversion rate for buying gldkrm20 with Stablecoin
    bool isActive;
    

    constructor(
        IERC20 _gldkrm20,
        uint256 _rate
    ) {
        require(_rate > 0, "Rate must be greater than 0");
        gldkrm20 = _gldkrm20;
        rate = _rate;
        admins[msg.sender] = true;
        isActive = true;
    }


    /**
     *  FUNCTIONS & MODIFIERS
     */
    modifier onlyAdmins() {
        require(admins[msg.sender] == true, "Not an admin");
        _;
    }


    modifier onlyIfActivated(){
        require(isActive == true, "Method is not active");
        _;
    }


    function addAdmin(address admin) external onlyAdmins{
        require(admin != address(0), "Invalid address");
        require(!admins[admin], "Already an admin");
        admins[admin] = true;
    }


    function setIsActivated(bool activate) external onlyAdmins{
        isActive = activate;
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

    function buy(uint256 _amount, address _stablecoinAddress) public nonReentrant onlyIfActivated{
        require(authorizedStablecoins[_stablecoinAddress] == true, "Stablecoin not registered");
        require(_stablecoinAddress != address(0), "Invalid address");
        IERC20 stablecoin = IERC20(_stablecoinAddress);

        uint256 userStablecoinBalance = stablecoin.balanceOf(msg.sender);
        require(userStablecoinBalance >= _amount, "Insufficient amount");

        uint256 gldkrmAmount = _amount * rate;
        uint256 gldkrm20Balance = gldkrm20.balanceOf(address(this));
        require(gldkrm20Balance >= gldkrmAmount, "Not enough GLDKRM available");
        
        stablecoin.transferFrom(msg.sender, address(this), gldkrmAmount);
        stablecoinBalances[_stablecoinAddress] = stablecoinBalances[_stablecoinAddress] + gldkrmAmount;
        gldkrm20.transfer(msg.sender, gldkrmAmount);

        emit Bought(msg.sender, _stablecoinAddress, _amount, gldkrmAmount);
    }


    function withdrawal(uint256 amount, address _stablecoinAddress) external onlyAdmins nonReentrant{
        require(_stablecoinAddress != address(0), "Invalid address");
        require(stablecoinBalances[_stablecoinAddress] >= amount, "Insufficient amount");
        IERC20 stablecoin = IERC20(_stablecoinAddress);
        
        stablecoinBalances[_stablecoinAddress] = stablecoinBalances[_stablecoinAddress] - amount;
        stablecoin.transfer(msg.sender, amount);

        emit Withdrawal(msg.sender, _stablecoinAddress, amount);
    }


}
