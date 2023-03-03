const { network } = require("hardhat");

const { developmentChains, DECIMALS, INITIAL_ANSWER } = require('../helper-hardhat-config');

module.exports = async (hre) => {
  console.log('Deploying mocks...');

  const { getNamedAccounts, deployments } = hre;

  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainName = network.name;

  if (developmentChains.includes(chainName)) {
    log('Local network detected. Deploying mocks!');
    await deploy('MockV3Aggregator', {
      from: deployer,
      log: true,
      args: [DECIMALS, INITIAL_ANSWER]
    });
    log('Mocks deployed');
    log('--------------------------------------------------------');
  }
};

module.exports.tags = ['all', 'mocks'];
