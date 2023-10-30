const { expect } = require("chai")
const { ethers } = require("hardhat")

const {
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("GLDKRM test", () => {


    async function deployFixture(): Promise<Object> {
        const [address1, address2] = await ethers.getSigners()
        const share1 = BigInt(63000000) * BigInt(10 ** 18)
        const share2 = BigInt(37000000) * BigInt(10 ** 18)
        return { address1, address2, share1, share2 }
    }


    it("Should deploy GLDKRM", async () => {
        const { address1, address2, share1, share2 } = await loadFixture(deployFixture)
        const gldkrmFactory = await ethers.getContractFactory('GLDKRM')
        const gldkrm = await gldkrmFactory.deploy(address1, share1, address2, share2)
        expect(await gldkrm.symbol()).to.be.equals('GLDKRM')
        expect(await gldkrm.balanceOf(address1.address)).to.be.equals(BigInt(63000000) * BigInt(10 ** 18))
        expect(await gldkrm.balanceOf(address2.address)).to.be.equals(BigInt(37000000) * BigInt(10 ** 18))
    })
})