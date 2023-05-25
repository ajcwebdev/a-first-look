# A First Look at Dash

https://github.com/dashpay/platform/tree/master/packages/js-dash-sdk/docs

## Clone Repo and Navigate to Project

```bash
git clone https://github.com/ajcwebdev/a-first-look.git
cd web3/dash
```

## Install Project Dependencies

```bash
pnpm i
```

## Set Environment Variables

```bash
cp .env.example .env
```

If you don't already have one, create a wallet:

```bash
pnpm createWallet
```

Copy `WALLET_ADDRESS` and `MNEMONIC` and paste them into `.env`.

## Start Development Server

```bash
pnpm serve
```

```bash
curl "http://localhost:3001/name/ajcwebdevtest"
```