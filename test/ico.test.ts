const { expect } = require("chai")
const { BigNumber } = require("ethers")
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers")


const RATE = 12
const ICO_SHARES = 63000000
const PRIVATE_SHARES = 37000000
const USER_STABLECOIN_INIT_BALANCE = 1000


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
        expect(await icoContract.stablecoinBalances(await usdc.getAddress())).to.be.equals(stableAmount)
        expect(await usdc.balanceOf(user.address)).to.be.equals(BigInt(USER_STABLECOIN_INIT_BALANCE - stableAmount))
    })


    it("Buy method should be disabled", async () => {
        const { admin1, icoContract, user, usdc } = await loadFixture(deployFixture)

        await icoContract.connect(admin1).setIsActivated(false)
        await expect(icoContract.connect(user).buy(100, await usdc.getAddress())).to.be.revertedWith('Method is not active')
    })


    it("Admin should Withdraw", async () => {
        const { admin1, icoContract, user, usdc } = await loadFixture(deployFixture)

        const stableAmount = 100
        await usdc.connect(user).approve(await icoContract.getAddress(), stableAmount)
        await icoContract.connect(user).buy(stableAmount, await usdc.getAddress())
        expect(await icoContract.stablecoinBalances(await usdc.getAddress())).to.be.equals(stableAmount)

        await expect(icoContract.connect(admin1).withdrawal(stableAmount + 1, await usdc.getAddress()))
            .to.be.revertedWith('Insufficient amount')
        expect(await icoContract.connect(admin1).withdrawal(stableAmount, await usdc.getAddress()))


        expect(await usdc.balanceOf(admin1)).to.be.equals(stableAmount)
        expect(await icoContract.stablecoinBalances(await usdc.getAddress())).to.be.equals(0)
    })


    it("Withdrawal should emit event", async () => {
        const { admin1, icoContract, user, usdc } = await loadFixture(deployFixture)

        const stableAmount = 100
        await usdc.connect(user).approve(await icoContract.getAddress(), stableAmount)
        await icoContract.connect(user).buy(stableAmount, await usdc.getAddress())

        const usdcAddress = await usdc.getAddress()

        await expect(icoContract.connect(admin1).withdrawal(stableAmount, usdcAddress))
            .to.emit(icoContract, 'Withdrawal')
            .withArgs(admin1.address, usdcAddress, stableAmount)
    })


    it("Not admin shouldn't Withdraw", async () => {
        const { icoContract, user, usdc } = await loadFixture(deployFixture)

        const stableAmount = 100
        await usdc.connect(user).approve(await icoContract.getAddress(), stableAmount)
        await icoContract.connect(user).buy(stableAmount, await usdc.getAddress())

        const usdcAddress = await usdc.getAddress()

        await expect(icoContract.connect(user).withdrawal(stableAmount, usdcAddress)).to.be.revertedWith('Not an admin')
    })


    it("Should add admin", async () => {
        const { admin1, admin2, icoContract, user } = await loadFixture(deployFixture)
        expect(await icoContract.admins(await admin2.getAddress())).to.be.equals(false)
        await icoContract.connect(admin1).addAdmin(await admin2.getAddress())
        expect(await icoContract.admins(await admin2.getAddress())).to.be.equals(true)
        await expect(icoContract.connect(user).addAdmin(await user.getAddress())).to.be.revertedWith('Not an admin')

    })


    it("Should revert insufficient stablecoin amount", async () => {
        const { user, icoContract, gldkrmContract, usdc } = await loadFixture(deployFixture)
        const stableAmount = 1001

        const usdcAddress = await usdc.getAddress()
        const icoContractAddress = await icoContract.getAddress()
        await usdc.connect(user).approve(icoContractAddress, stableAmount)

        await expect(icoContract.connect(user).buy(stableAmount, usdcAddress))
            .to.be.revertedWith('Insufficient amount')
    })


    it("Should revert insufficient gldkrm coin amount", async () => {
        const { user, icoContract, gldkrmContract, usdc } = await loadFixture(deployFixture)
        const stableAmount = 1000000000

        await usdc.mint(await user.getAddress(), stableAmount)

        const usdcAddress = await usdc.getAddress()
        const icoContractAddress = await icoContract.getAddress()
        await usdc.connect(user).approve(icoContractAddress, stableAmount)

        await expect(icoContract.connect(user).buy(stableAmount, usdcAddress))
            .to.be.revertedWith('Not enough GLDKRM available')
    })


    it("Should remove stablecoin", async () => {
        const { admin1, user, icoContract, gldkrmContract, usdc } = await loadFixture(deployFixture)

        const usdcAddress = await usdc.getAddress()
        await icoContract.connect(admin1).removeStablecoin(usdcAddress)
        expect(await icoContract.authorizedStablecoins(usdcAddress)).to.be.equals(false)

        await expect(icoContract.connect(user).authorizeStablecoin(usdcAddress)).to.be.revertedWith('Not an admin')

    })
})