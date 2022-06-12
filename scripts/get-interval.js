const { ethers } = require("hardhat");

async function getRaffleInterval() {
  const raffle = await ethers.getContract("Raffle");
  const interval = await raffle.getInterval();
  console.log(`Interval ${interval.toString()}`);
}

getRaffleInterval()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
