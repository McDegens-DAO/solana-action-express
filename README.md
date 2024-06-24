# solana-action-express
Solana Actions server powered by Node and Express

This server package provides Solana Actions endpoints for Solana Blinks

Learn more about Solana Actions here: 

https://gist.github.com/nickfrosty/ba1cb3c9d589557396c9b12969f98039

Here's a live example of a McDegens Donation Blink powered by our **solana-action-express** server.

https://actions.dialect.to/?action=solana-action:https://actions.mcdegen.xyz:8444/donate-config

![solana blink](https://github.com/McDegens-DAO/solana-action-express/blob/main/blink.png)

# Install
Clone the repo.
```javascript
git clone https://github.com/McDegens-DAO/solana-action-express.git
```

# RPC
Open the rpcs/helius.json file to configure.
```javascript
[
  {
    "name": "Helius 1",
    "wallet": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    "url": "https://mainnet.helius-rpc.com/?api-key=bbbbbbbbbbbbbbbbbbbbbbbbbb"
  }
]
```
Move the rpcs folder somewhere safe. i.e. server root directory.

# Configure
Open the src/actions.js file to configure.
```javascript
// server settings
const https_port = 8444; //~ port 
const primary_app = ""; //~ https://mcdegen.xyz
const server_host = ""; //~ https://actions.mcdegen.xyz
const rpc_file = ""; //~ ../../../rpcs/helius.json
const rpc_id = 0; //~ default rpc selection from the file above
const ssl_crt = ""; //~ ../../../ssl/certs/YOUR_CERT_FILE.crt
const ssl_key = ""; //~ ../../../ssl/keys/YOUR_KEY_FILE.key
let tolerance = 1.2; //~ adds cu to txs in case the estimates are too low
let priority = "High"; //~ default tx priority
```

# Start Server
Using Node
```javascript
node src/actions.js
```
Using PM2
```javascript
first time start
pm2 start src/actions.js
```
```javascript
pm2 start actions
```
```javascript
pm2 restart actions
```
```javascript
pm2 stop actions
```




