pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DappToken is ERC20 {
    constructor(uint256 _initialSupply) public ERC20("Dapp Token", "DAPP"){
        _mint(msg.sender, _initialSupply);
    }
}
