const BOKCoin = artifacts.require("BOKCoin");
const SafeMath = artifacts.require("SafeMath");
module.exports = function(deployer) {
  deployer.deploy(BOKCoin, 21000000);
  deployer.deploy(SafeMath);
};
