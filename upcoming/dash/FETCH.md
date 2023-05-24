### getBestBlockHash with Fetch

```bash
pnpm add node-fetch@2
echo > getBestBlockHashFetch.js
```

```js
// getBestBlockHashFetch.js

import fetch from "node-fetch"

async function getBestBlockHashFetch() {
  const response = await fetch("https://seed-1.testnet.networks.dash.org:1443", {
    method: "POST",
    headers: {'content-type': 'application/json'},
    body: '{"method":"getBestBlockHash","id":1,"jsonrpc":"2.0"}'
  })
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  let res
  try {
    res = await response.json()
  } catch (error) {
    throw new Error(`Couldn't parse response as JSON: ${error}`)
  }
  if (res.result === undefined) {
    throw new Error(`Unexpected response object: ${JSON.stringify(res)}`)
  }
  console.log(JSON.stringify(res))
}

getBestBlockHashFetch()
  .catch(err => console.error('Error:', err))
```

```bash
node getBestBlockHashFetch
```

```json
{"jsonrpc":"2.0","id":1,"result":"0000005ea6cd580682a33ab97d19732905c069a17c5ab5800bbdbe2fa8681666"}
```

### getBlockHash with Fetch

```bash
echo > getBlockHashFetch.js
```

```js
// getBlockHashFetch.js

import fetch from "node-fetch"

async function getBlockHashFetch() {
  const response = await fetch("https://seed-1.testnet.networks.dash.org:1443", {
    method: "POST",
    headers: {'content-type': 'application/json'},
    body: JSON.stringify({
      method: "getBlockHash",
      id: 1,
      jsonrpc: "2.0",
      params: {
        height: 1
      }
    }),
  })
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  let res
  try {
    res = await response.json()
  } catch (error) {
    throw new Error("Couldn't parse response as JSON: " + error)
  }
  if (res.result === undefined) {
    throw new Error(`Unexpected response object: ${JSON.stringify(res)}`)
  }
  console.log(JSON.stringify(res))
}

getBlockHashFetch()
  .catch(err => console.error('Error:', err))
```

```bash
node getBlockHashFetch
```

```json
{"jsonrpc":"2.0","id":1,"result":"0000047d24635e347be3aaaeb66c26be94901a2f962feccd4f95090191f208c1"}
```