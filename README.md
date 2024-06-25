# solana-action-express
solana actions server powered by node & express

this server package provides solana actions endpoints for solana blinks

official solana actions docs here: 

https://solana.com/docs/advanced/actions

https://github.com/solana-developers/solana-actions

support for this repo: https://discord.gg/2wxSwjuxTc

here's a live example of a mcdegens donation blink powered by **solana-action-express**

https://actions.dialect.to/?action=solana-action:https://actions.mcdegen.xyz:8444/donate-config

![solana blink](https://github.com/McDegens-DAO/solana-action-express/blob/main/blink.png)

# install
clone the repo
```javascript
git clone https://github.com/McDegens-DAO/solana-action-express.git
```
move the files
```javascript
mv solana-action-express/* .
```
install dependencies
```javascript
npm install
```

# rpc
open the rpcs/helius.json file to configure
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

# config
open the src/actions.js file to configure
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

# start
using node
```javascript
node src/actions.js
```
using pm2
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

# test
test on dialect
```javascript
https://actions.dialect.to/?action=solana-action:https://{YOUR.SERVER.XYZ}:8444/donate-config
```
test with a rest client
```javascript
// GET
https://actions.dialect.to/?action=solana-action:https://{YOUR.SERVER.XYZ}:8444/donate-config
```
```javascript
// POST
https://actions.dialect.to/?action=solana-action:https://{YOUR.SERVER.XYZ}:8444/donate-build?amount=0.0001
// HEADER
Content-Type: application/json
// BODY
{
  "account": "B8owyFUUu46g8Z4JNZMXmLSc2D725zv6fcXuBewGeTyj"
}
```

# active
actions.json

In the root of your primary app, create a file named: actions.json

Website: https://yourwebsite.xyz

Actions: https://yourwebsite/actions.json

Add the following:

```javascript
{
  "rules": [
    {
      "pathPattern": "*",
      "apiPath": "https://{YOUR.SERVER.XYZ}:8444/donate-config"
    }
  ]
}
```



