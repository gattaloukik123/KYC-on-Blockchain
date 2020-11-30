var SimpleStorage = artifacts.require("./SimpleStorage.sol");
const KycBlockChain = artifacts.require("./KycBlockChain.sol");

module.exports = function (deployer) {
  deployer.deploy(SimpleStorage);
  deployer.deploy(KycBlockChain);
};
