const { getNamedAccounts, ethers } = require('hardhat');

const main = async () => {
  const { deployer } = await getNamedAccounts();
  const fundMe = await ethers.getContract('FundMe', deployer);
  
  console.log('Withdrawing funds...');
  const txResponse = await fundMe.withdraw();
  txResponse.wait();
  console.log('Withdraw successful!');
};

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })