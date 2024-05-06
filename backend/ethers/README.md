# Example Project from [A First Look at Hardhat and Ethers](https://ajcwebdev.com/2022/03/04/a-first-look-at-ethers-and-hardhat)

[ethers.js](https://ethers.org/) is a library that aims to be a complete and compact tool for interacting with the Ethereum Blockchain and its ecosystem. This example uses [Hardhat](https://hardhat.org/), an Ethereum development environment, to compile a smart contract and deploy it to [Ropsten](https://ropsten.etherscan.io/), an Ethereum test network that allows for blockchain development testing.

The contract is written in [Solidity](https://docs.soliditylang.org/), an object-oriented, high-level language for implementing smart contracts. After deploying the contract, we will generate a boilerplate React application with [Vite](https://vitejs.dev/) and connect the application to our smart contract running on Ropsten. [Alchemy](https://www.alchemy.com/) provides a [managed node](https://www.infoq.com/articles/blockchain-as-a-service-get-block/) that enables connecting to various tools in the blockchain ecosystem.

## Clone Repo and Navigate to Project

```bash
git clone https://github.com/ajcwebdev/a-first-look.git
cd web3/ethers
```

## Set Environment Variables

```bash
cp .env.example .env
```

Include `ALCHEMY_URL` and `ALCHEMY_KEY`.

```
ALCHEMY_URL=
ALCHEMY_KEY=
```

## Install Project Dependencies and Start Development Server

```bash
pnpm i
pnpm dev
```