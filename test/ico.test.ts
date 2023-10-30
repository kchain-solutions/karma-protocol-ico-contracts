const { expect } = require("chai")
const { BigNumber } = require("ethers")
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");


const RATE = 12
const ICO_SHARES = 63000000
const PRIVATE_SHARES = 37000000
const USER_STABLECOIN_INIT_BALANCE = 1000000


describe("ICO", () => {


    async function deployFixture() {
        const [admin1, admin2, user] = await ethers.getSigners()

        const icoFactory = await ethers.getContractFactory('ICO')
        const icoContract = await icoFactory.deploy(RATE)
        const icoContractAddress = await icoContract.getAddress()

        const gldkrmFactory = await ethers.getContractFactory('GLDKRM')
        const gldkrmContract = await gldkrmFactory.deploy(icoContractAddress, ICO_SHARES, admin1.address, PRIVATE_SHARES)
        const gldkrmContractAddress = await gldkrmContract.getAddress()

        const testTokenFactory = await ethers.getContractFactory('TestToken')
        const usdc = await testTokenFactory.deploy('usdc', 'usdc')
        await usdc.mint(user.address, USER_STABLECOIN_INIT_BALANCE)
        const naToken = await testTokenFactory.deploy('Not auth', 'NA')
        naToken.mint(user.address, USER_STABLECOIN_INIT_BALANCE)
        const usdcAddress = await usdc.getAddress()

        icoContract.setGldkrmAddress(gldkrmContractAddress)
        icoContract.authorizeStablecoin(usdcAddress)

        expect(await icoContract.admins(admin1)).to.be.equals(true)
        expect(await gldkrmContract.balanceOf(icoContractAddress)).to.be.equals(ICO_SHARES)

        return { admin1, admin2, user, gldkrmContract, icoContract, usdc, naToken }
    }


    it("Should buy token", async () => {
        const { user, icoContract, gldkrmContract, usdc } = await loadFixture(deployFixture)
        const stableAmount = 100

        const usdcAddress = await usdc.getAddress()
        const icoContractAddress = await icoContract.getAddress()
        await usdc.connect(user).approve(icoContractAddress, stableAmount)

        await expect(icoContract.connect(user).buy(stableAmount, usdcAddress))
            .to.emit(icoContract, 'Bought')
            .withArgs(user.address, usdcAddress, BigInt(stableAmount), BigInt(stableAmount * RATE))

        expect(await gldkrmContract.balanceOf(user.address)).to.be.equals(BigInt(stableAmount * RATE))
        expect(await usdc.balanceOf(user.address)).to.be.equals(BigInt(USER_STABLECOIN_INIT_BALANCE - stableAmount))
    })


    it("Buy method should be disabled", () => {

    })


    it("Admin should Withdraw", () => {

    })


    it("Not admin shouldn't Withdraw", () => {

    })


    it("Should add admin", () => {

    })


    it("Should remove admin", () => {

    })


    it("Should revert insufficient amount", () => {

    })
})