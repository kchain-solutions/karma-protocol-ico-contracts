require('dotenv').config()
const hre = require("hardhat")


async function main() {
    const WAIT_BLOCK_CONFIRMATIONS = 6
    const RATE = 30
    const ICO_POOL_SHARES = BigInt(65000000) * BigInt(10 ** 18)
    const PRIVATE_SHARES = BigInt(35000000) * BigInt(10 ** 18)

    /**
     * Deploying ICO contract
     */
    const [deployer] = await hre.ethers.getSigners()
    console.log("Deploying contracts with the account: ", deployer.address)
    console.log("Account balance: ", (await ethers.provider.getBalance(deployer.address)).toString())
    console.log('\n')

    console.log("Deploying ICO contract with the account:", deployer.address)
    const ico = await ethers.deployContract('ICO', [RATE])
    await ico.waitForDeployment()

    console.log("\nWaiting for", WAIT_BLOCK_CONFIRMATIONS, "confirmations...")
    let receipt = await ico.deploymentTransaction().wait(WAIT_BLOCK_CONFIRMATIONS)
    console.log(`Contract ICO deployed to ${await ico.getAddress()} on ${hre.network.name}. Block number ${receipt.blockNumber} `)

    try {
        await hre.run("verify:verify", {
            address: await ico.getAddress(),
            constructorArguments: [RATE]
        })
    } catch (error) {
        console.error(error)
    }

    console.log('\n\n')

    /**
     * Deploying GLDKRM contract
     */
    console.log("Deploying GLDKRM contract with the account:", deployer.address)

    const constructorArgs = [await ico.getAddress(), ICO_POOL_SHARES, deployer.address, PRIVATE_SHARES]
    const gldkrm = await ethers.deployContract("GLDKRM", constructorArgs)
    await gldkrm.waitForDeployment()

    console.log("\nWaiting for", WAIT_BLOCK_CONFIRMATIONS, "confirmations...")
    receipt = await gldkrm.deploymentTransaction().wait(WAIT_BLOCK_CONFIRMATIONS)
    console.log(`Contract GLDKM deployed to ${await gldkrm.getAddress()} on ${hre.network.name}. Block number ${receipt.blockNumber}`)


    try {
        await hre.run("verify:verify", {
            address: await gldkrm.getAddress(),
            constructorArguments: constructorArgs
        })
    } catch (error) {
        console.error(error)
    }

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })