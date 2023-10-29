require("@nomicfoundation/hardhat-toolbox")
require("dotenv").config()

const MNEMONIC = process.env.MNEMONIC
const EVM_TESTNET_ENDPOINT = process.env.EVM_TESTNET_ENDPOINT
const EVM_PROD_ENDPOINT = process.env.EVM_PROD_ENDPOINT
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY
const KRC20_ADDRESS = process.env.KRC20_ADDRESS

function accounts(): Object {
    return { mnemonic: MNEMONIC }
}

module.exports = {
    solidity: "0.8.20",
    networks: {
        testnet: {
            gas: "auto",
            gasPrice: "auto",
            url: EVM_TESTNET_ENDPOINT,
            accounts: accounts()
        },
        prod: {
            gas: "auto",
            gasPrice: "auto",
            url: EVM_PROD_ENDPOINT,
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