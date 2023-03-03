const { run } = require("hardhat");
require('dotenv').config();

const verify = async (contractAddress, args) => {
  try {
    console.log('Verifying contract...', args);
    await run('verify:verify', {
      address: contractAddress,
      constructorArguments: args
    });
    console.log('Verified');
  } catch (err) {
    if (err.message.toLowerCase().includes('already verified')) {
      console.log('already verified');
    }
    console.error(err);
  }
};

module.exports = {
  verify
}