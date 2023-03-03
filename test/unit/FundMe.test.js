const { deployments, ethers, getNamedAccounts, network } = require('hardhat');
const { assert, expect } = require('chai');
const { developmentChains } = require('../../helper-hardhat-config');

!developmentChains.includes(network.name)
  ? describe.skip :
  describe('FundMe', async () => {

    let fundMe, deployer, mockAggregator;
    const sendValue = ethers.utils.parseEther('1');

    beforeEach(async () => {
      deployer = (await getNamedAccounts()).deployer;
      const response = await deployments.fixture(["all"]);
      fundMe = await ethers.getContract('FundMe', deployer);
      mockAggregator = await ethers.getContract('MockV3Aggregator', deployer);
    });

    describe('constructor', async() => {
      it('sets price feed and owner correctly', async () => {
        const response = await fundMe.getPriceFeed();
        // console.log({response: response, mock: mockAggregator.address});
        assert.equal(response, mockAggregator.address);
      });
    });

    describe('fund', async () => {
      it('fails if not sending enough ETH', async () => {
        await expect(fundMe.fund()).to.be.revertedWithCustomError(fundMe, 'FundMe__AmountTooLess')
      });

      it('amount funded data structure is updated', async () => {
        await fundMe.fund({ value: sendValue });
        const response = await fundMe.getAddressToAmountFunded(deployer);
        assert.equal(response.toString(), sendValue.toString());
      });

      it('funder is added to the array', async () => {
        await fundMe.fund({value: sendValue});
        const response = await fundMe.getFunder(0);
        assert.equal(response, deployer);
      });
    });

    describe('withdraw', async () => {
      beforeEach(async () => {
        await fundMe.fund({ value: sendValue });
      });

      it('withdraw ETH for a single funder', async () => {
        // Arrange
        const startingBalanceFundMe = await fundMe.provider.getBalance(fundMe.address);
        const startingBalanceDeployer = await fundMe.provider.getBalance(deployer);
        
        // Act
        const transactionResponse = await fundMe.withdraw();
        const transactionReceipt = await transactionResponse.wait(1);

        const { gasUsed, effectiveGasPrice } = transactionReceipt;
        const gasCost = effectiveGasPrice.mul(gasUsed);

        const endingBalanceFundMe = await fundMe.provider.getBalance(fundMe.address);
        const endingBalanceDeployer = await fundMe.provider.getBalance(deployer);

        // Assert
        assert.equal(endingBalanceFundMe, 0);
        assert.equal(
          startingBalanceDeployer.add(startingBalanceFundMe).toString(),
          endingBalanceDeployer.add(gasCost).toString()
        );
      });

      it('withdraw ETH for multiple getFunder', async () => {
        // Arrange
        const accounts = await ethers.getSigners();
        for (let i = 0; i < 5; i++) {
          const connectedContract = await fundMe.connect(accounts[i]);
          await connectedContract.fund({ value: sendValue });
        }

        const startingBalanceFundMe = await fundMe.provider.getBalance(fundMe.address);
        const startingBalanceDeployer = await fundMe.provider.getBalance(deployer);
        
        // Act
        const transactionResponse = await fundMe.withdraw();
        const transactionReceipt = await transactionResponse.wait(1);

        const { gasUsed, effectiveGasPrice } = transactionReceipt;
        const gasCost = effectiveGasPrice.mul(gasUsed);

        const endingBalanceFundMe = await fundMe.provider.getBalance(fundMe.address);
        const endingBalanceDeployer = await fundMe.provider.getBalance(deployer);

        // Assert
        assert.equal(endingBalanceFundMe, 0);
        assert.equal(
          startingBalanceDeployer.add(startingBalanceFundMe).toString(),
          endingBalanceDeployer.add(gasCost).toString()
        );

        await expect(fundMe.getFunder(0)).to.be.reverted
        for (let i = 0; i < 5; i++) {
          const amount = await fundMe.getAddressToAmountFunded(accounts[i].address);
          assert.equal(amount, 0);
        }
      });

      it('Only allows the owner to withdraw', async () => {
        const accounts = await ethers.getSigners();
        const fundMeConnectedContract = await fundMe.connect(accounts[1]);

        // await fundMeConnectedContract.withdraw();
        await expect(fundMeConnectedContract.withdraw()).to.be.revertedWithCustomError(
          fundMeConnectedContract,
          'FundMe__NotOwner'
        );
      });
    });

    describe('cheaper withdraw', async () => {
      beforeEach(async () => {
        await fundMe.fund({ value: sendValue });
      });

      it('withdraw ETH for a single funder', async () => {
        // Arrange
        const startingBalanceFundMe = await fundMe.provider.getBalance(fundMe.address);
        const startingBalanceDeployer = await fundMe.provider.getBalance(deployer);
        
        // Act
        const transactionResponse = await fundMe.cheaperWithdraw();
        const transactionReceipt = await transactionResponse.wait(1);

        const { gasUsed, effectiveGasPrice } = transactionReceipt;
        const gasCost = effectiveGasPrice.mul(gasUsed);

        const endingBalanceFundMe = await fundMe.provider.getBalance(fundMe.address);
        const endingBalanceDeployer = await fundMe.provider.getBalance(deployer);

        // Assert
        assert.equal(endingBalanceFundMe, 0);
        assert.equal(
          startingBalanceDeployer.add(startingBalanceFundMe).toString(),
          endingBalanceDeployer.add(gasCost).toString()
        );
      });

      it('withdraw ETH for multiple getFunder', async () => {
        // Arrange
        const accounts = await ethers.getSigners();
        for (let i = 0; i < 5; i++) {
          const connectedContract = await fundMe.connect(accounts[i]);
          await connectedContract.fund({ value: sendValue });
        }

        const startingBalanceFundMe = await fundMe.provider.getBalance(fundMe.address);
        const startingBalanceDeployer = await fundMe.provider.getBalance(deployer);
        
        // Act
        const transactionResponse = await fundMe.cheaperWithdraw();
        const transactionReceipt = await transactionResponse.wait(1);

        const { gasUsed, effectiveGasPrice } = transactionReceipt;
        const gasCost = effectiveGasPrice.mul(gasUsed);

        const endingBalanceFundMe = await fundMe.provider.getBalance(fundMe.address);
        const endingBalanceDeployer = await fundMe.provider.getBalance(deployer);

        // Assert
        assert.equal(endingBalanceFundMe, 0);
        assert.equal(
          startingBalanceDeployer.add(startingBalanceFundMe).toString(),
          endingBalanceDeployer.add(gasCost).toString()
        );

        await expect(fundMe.getFunder(0)).to.be.reverted
        for (let i = 0; i < 5; i++) {
          const amount = await fundMe.getAddressToAmountFunded(accounts[i].address);
          assert.equal(amount, 0);
        }
      });
    });
  });

