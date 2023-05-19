## Deploy Smart Contract with Hardhat

```bash
cp hardhat/.env.sample hardhat/.env
```

Set environment variables in `hardhat/.env` for your wallet's private key and your network's RPC endpoint.

```bash
cd hardhat
yarn
yarn hardhat compile
yarn hardhat run scripts/deploy.js --network ropsten
cd ..
```

Set the deployed contract address to the `CONTRACT_ADDRESS` variable in `App.svelte`

## Run Svelte App with Vite Development Server

```bash
cd svelte
yarn
yarn dev
```

## Deploy Svelte App to Vercel

```bash
yarn vercel
```