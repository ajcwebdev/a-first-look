// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.6;

import "hardhat/console.sol";

contract HelloWorld {
  string private helloMessage;

  constructor(string memory _helloMessage) {
    console.log(_helloMessage);
    helloMessage = _helloMessage;
  }

  function hello() public view returns (string memory) {
    return helloMessage;
  }

  function setHello(string memory _helloMessage) public {
    console.log("Changing helloMessage from '%s' to '%s'", helloMessage, _helloMessage);
    helloMessage = _helloMessage;
  }
}