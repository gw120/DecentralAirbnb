/* scripts/deploy.js */
const hre = require("hardhat");
const fs = require('fs');
const { verify } = require('../utils/verify')

const LOCAL_NETWORKS = ["localhost", "ganache"]

async function deployMock() {
    const DECIMALS = "8"
    const INITIAL_PRICE = "200000000000"

    const Mock = await hre.ethers.getContractFactory("MockV3Aggregator")

    console.log("Deploying price feed mock");
    const mockContract = await Mock.deploy(DECIMALS, INITIAL_PRICE)

    await mockContract.deployed();
    console.log("Price feed mock deployed to:", mockContract.address);

    return mockContract.address;
}

async function main() {
    /* these two lines deploy the contract to the network */
    let listingFee = hre.ethers.utils.parseEther("0.001", "ether");
    var priceFeedAddress;
    if (LOCAL_NETWORKS.includes(hre.network.name)) {
        priceFeedAddress = await deployMock()
    }

  // For deploying to polygon mainnet or testnet
  // const priceFeedAddress = ""

    console.log(mockAddress)

    const DecentralAirbnb = await hre.ethers.getContractFactory("DecentralAirbnb")
    const airbnbContract = await DecentralAirbnb.deploy(listingFee, priceFeedAddress)

    await airbnbContract.deployed();
    console.log("Decentral Airbnb deployed to:", airbnbContract.address);

    /* this code writes the contract addresses to a local */
    /* file named config.js that we can use in the app */

    fs.writeFileSync('../src/utils/contracts-config.js', `

  export const contractAddress = "${airbnbContract.address}"
  export const ownerAddress = "${airbnbContract.signer.address}"
  `)
    if (!LOCAL_NETWORKS.includes(hre.network.name) && hre.config.etherscan.apiKey !== "") {
        await airbnbContract.deployTransaction.wait(6)
        await verify(airbnbContract.address, [listingFee, priceFeedAddress])
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });