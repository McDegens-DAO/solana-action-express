# solana-action-express
solana actions server powered by node & express

this server package provides solana actions endpoints for solana blinks

official solana actions docs here: 

https://solana.com/docs/advanced/actions

https://github.com/solana-developers/solana-actions

support for this repo: https://discord.gg/Z9bUEf8gYb

live example mcdegens donation blink powered by **solana-action-express**

https://actions.dialect.to/?action=solana-action:https://actions.mcdegen.xyz:8444/donate-config
![solana blink](https://github.com/McDegens-DAO/solana-action-express/blob/main/blink.png)

# install

please note this repo needs to run on a deployed server and will not run on localhost due to its ssl requirements.

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

# activate
actions.json

In the root of your primary app domain, create a file named: actions.json

Website: yourwebsite.xyz

Actions: yourwebsite/actions.json

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

# test
test with a rest client
```javascript
// GET
https://dial.to/?action=solana-action:https://{YOUR.SERVER.XYZ}:8444/donate-config
```
```javascript
// POST
https://dial.to/?action=solana-action:https://{YOUR.SERVER.XYZ}:8444/donate-build?amount=0.0001
// HEADER
Content-Type: application/json
// BODY
{
  "account": "7Z3LJB2rxV4LiRBwgwTcufAWxnFTVJpcoCMiCo8Z5Ere"
}
```

test on dialect
```javascript
https://dial.to/?action=solana-action:https://{YOUR.SERVER.XYZ}:8444/donate-config
```
unfurling test

go to: https://dial.to

search: yourwebsite.xyz

if your blink is active it will load!

if not, use the browsers code inspector to debug

# rendering on x
it's important to note that in order for a blink to render on X the page you are sharing on X (i.e. https://yourwebsite.xyz) must have twitter-card metatags. we use the following tags:
```javascript
  <title>Page Title</title>
  <meta name="description" content="" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@xHandle" />
  <meta name="twitter:creator" content="@xHandle" />
  <meta name="twitter:title" content="" />
  <meta name="twitter:description" content="" />
  <meta name="twitter:image" content="" />
  <meta property="og:title" content="" />
  <meta property="og:image" content="" />
  <meta property="og:url" content="" />
  <meta property="og:description" content="" />
```
# actions domain registration
It is currently necessary to register the domain of your actions server or your blinka will not display on twitter.

This is the Dialect's google form to request approval: 

https://docs.google.com/forms/d/1YWt44VzqvSjJsvoqoOElPXnLmynABY2DS45UTVcm2a8/viewform

# x users
users on x need to have a supporting wallet or the dialect extension to see the blinks.

**supporting wallets/extensions**

backpack

phantom (enable in settings under "experimental features")

solflare (soon)

dialect
