const { getNamedAccounts, ethers } = require('hardhat');

const main = async () => {
  const { deployer } = await getNamedAccounts();
  const fundMe = await ethers.getContract('FundMe', deployer);
  console.log(`Got contract FundMe at ${fundMe.address}`);

  console.log('Funding...');
  const txResponse = await fundMe.fund({ value: ethers.utils.parseEther('0.1')});
  txResponse.wait();
  console.log('Funding successful!');
};

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });