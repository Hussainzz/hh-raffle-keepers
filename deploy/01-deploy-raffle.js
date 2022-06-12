
const {network, ethers} = require('hardhat');
const { developmentChain, networkConfig } = require('../helper-hardhat-config');
const { verify } = require('../utils/verify');


const VRF_SUB_FUND_AMOUNT = ethers.utils.parseEther("2")
module.exports = async function({getNamedAccounts, deployments}) {
    const {deploy, log} = deployments;
    const {deployer} = await getNamedAccounts();
    const chainId = network.config.chainId;

    let vrfCoordinatorV2Address, subscriptionId;
    
    if(developmentChain.includes(network.name)){
        const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address;

        const txnResponse = await vrfCoordinatorV2Mock.createSubscription();
        const txnReceipt = await txnResponse.wait(1);

        subscriptionId = txnReceipt.events[0].args.subId

        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, VRF_SUB_FUND_AMOUNT)

    }else{
        vrfCoordinatorV2Address = networkConfig[chainId]['vrfCoordinator']
        subscriptionId = networkConfig[chainId]['subscriptionId']
    }

    const entranceFee = networkConfig[chainId]['entranceFee']
    const gasLane = networkConfig[chainId]['gasLane']
    const callbackGasLimit = networkConfig[chainId]['callbackGasLimit']
    const interval = networkConfig[chainId]['interval']
    //const args = [vrfCoordinatorV2Address, subscriptionId, gasLane, interval, entranceFee, callbackGasLimit]
    const args = [vrfCoordinatorV2Address, entranceFee, gasLane, subscriptionId, callbackGasLimit, interval]

    const raffle = await deploy("Raffle",{
        from :deployer,
        args:args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1
    });
    
    if(!developmentChain.includes(network.name) && process.env.ETHERSCAN_API_KEY){
        log("Verifying....")
        await verify(raffle.address, args);
    }
    log("-----------------------------------------")
}

module.exports.tags = ["all", "raffle"];