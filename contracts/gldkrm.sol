// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract GLDKRM is ERC20 {
    constructor(
        address _icoPoolAddress,
        uint256 _icoPoolShares,
        address _privateAddress,
        uint256 _privateShares
    ) ERC20("Gold Karma", "GLDKRM") {
        _mint(_icoPoolAddress, _icoPoolShares);
        _mint(_privateAddress, _privateShares);
    }
}
