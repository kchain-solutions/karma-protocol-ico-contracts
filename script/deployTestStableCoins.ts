

require('dotenv').config()


async function main() {
    const WAIT_BLOCK_CONFIRMATIONS = 6
    const MINT_CAP = BigInt(100000000) * BigInt(10 ** 18)


    /**
     * Deploying ICO contract
     */
    const [deployer] = await hre.ethers.getSigners()
    console.log("Deploying contracts with the account: ", deployer.address)
    console.log("Account balance: ", (await ethers.provider.getBalance(deployer.address)).toString())
    console.log('\n')

    console.log("Deploying USDT contract with the account:", deployer.address)
    const usdt = await ethers.deployContract('TestToken', ["USDT", "USDT"])
    await usdt.waitForDeployment()
    await usdt.mint(deployer.address, MINT_CAP)
    console.log(`Contract USDT deployed to ${await usdt.getAddress()} on ${hre.network.name} `)

    console.log('\n\n')

    console.log("Deploying USDC contract with the account:", deployer.address)
    const usdc = await ethers.deployContract('TestToken', ["USDC", "USDC"])
    await usdc.waitForDeployment()
    await usdc.mint(deployer.address, MINT_CAP)
    console.log(`Contract USDC deployed to ${await usdc.getAddress()} on ${hre.network.name} `)

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })