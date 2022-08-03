pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TokenSale {

    address payable owner;

    IERC20 public dappToken;

    uint256 public tokenPrice;
    uint256 public tokensSold;

    event Sell(address _buyer, uint256 _amount);

    constructor(address _dappTokenAddress, uint256 _tokenPrice) {
        owner = payable(msg.sender);
        dappToken = IERC20(_dappTokenAddress);
        tokenPrice = _tokenPrice;
    }

    function buyTokens(uint256 _numberOfTokens) public payable {
        require(msg.value == _numberOfTokens * tokenPrice);
        require(dappToken.balanceOf(address(this)) >= _numberOfTokens);
        require(dappToken.transfer(msg.sender, _numberOfTokens));

        tokensSold += _numberOfTokens;

        emit Sell(msg.sender, _numberOfTokens);
    }

    function endSale() public {
        require(msg.sender == owner);
        require(dappToken.transfer(owner, dappToken.balanceOf(address(this))));

        owner.transfer(address(this).balance);
    }
}
