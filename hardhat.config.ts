import "@nomicfoundation/hardhat-toolbox"
import dotenv from 'dotenv'
dotenv.config()

const MNEMONIC = process.env.MNEMONIC
const EVM_ENDPOINT = process.env.SEPOLIA_ENDPOINT
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY
const KRC20_ADDRESS = process.env.KRC20_ADDRESS

function accounts(): Object {
    return { mnemonic: MNEMONIC }
}

module.exports = {
    solidity: "0.8.18",
    networks: {
        sepolia: {
            gas: "auto",
            gasPrice: "auto",
            url: EVM_ENDPOINT,
            accounts: accounts()
        }
    },
    mocha: {
        quiet: true
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY
    },
    settings: {
        optimizer: {
            enabled: true,
            runs: 200,
        }
    }
}