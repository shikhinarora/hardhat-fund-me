const { getNamedAccounts, ethers, network } = require('hardhat');
const { assert } = require('chai');
const { developmentChains } = require('../../helper-hardhat-config');

developmentChains.includes(network.name)
  ? describe.skip :
  describe('FundMe staging tests', async () => {
    let fundMe, deployer;
    const sendValue = ethers.utils.parseEther('0.04');
    beforeEach(async () => {
      deployer = (await getNamedAccounts()).deployer;
      fundMe = await ethers.getContract('FundMe', deployer);
    });

    it('Able to send and withdraw funds', async() => {
      const fundTxResponse = await fundMe.fund({ value: sendValue });
      // await fundTxResponse.wait(1);
      const withdrawTxResponse = await fundMe.withdraw();
      // await withdrawTxResponse.wait(1);

      const endingBalance = await fundMe.provider.getBalance(fundMe.address);
      assert.equal(endingBalance.toString(), 0);
    }).timeout(60000);
  });