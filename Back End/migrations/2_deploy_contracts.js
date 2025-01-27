const voting = artifacts.require("Back End/contracts/Voting.sol");

module.exports = function(deployer) {
  deployer.deploy(voting);
};