const { network } = require("hardhat");

const { networkConfig, developmentChains } = require('../helper-hardhat-config');
const { verify } = require('../utils/verify');

module.exports = async (hre) => {
  console.log('Deploying FundMe...');

  const { getNamedAccounts, deployments } = hre;

  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  const chainName = network.name;

  let ethUsdPriceFeed;

  if (developmentChains.includes(chainName)) {
    const mockV3AggregatorContract = await deployments.get('MockV3Aggregator');
    ethUsdPriceFeed = await mockV3AggregatorContract.address;
  } else {
    ethUsdPriceFeed = networkConfig[chainId].ethUsdPriceFeed;
  }

  const args = [
    // put priceFeedAddress
    ethUsdPriceFeed
  ];

  console.log({ethUsdPriceFeed});

  // when using localhost, use mocks
  const fundMe = await deploy('FundMe', {
    from: deployer,
    args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1
  });

  if (!developmentChains.includes(chainName) && process.env.ETHERSCAN_API_KEY) {
    await verify(fundMe.address, args);
  }

  log('Fund Me deployed');
  log('--------------------------------------------------------');
};

module.exports.tags = ['all', 'FundMe'];
