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

test on dialect
```javascript
https://dial.to/?action=solana-action:http://localhost:3001/donate-config
```

# rendering on x
it's important to note that in order for a blink to render on x the page you are sharing on x (i.e. https://yourwebsite.xyz/donate) must have twitter-card metatags. we used the following tags:
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
you can test that your page is twitter-card enabled using this tool:

https://www.bannerbear.com/tools/twitter-card-preview-tool/

# actions registration
It is currently necessary to register the domain of your actions server or else your blinks will not render on x.

This is dialect's google form to request approval: 

https://docs.google.com/forms/d/1YWt44VzqvSjJsvoqoOElPXnLmynABY2DS45UTVcm2a8/viewform

# x users
users on x need to have a supporting wallet or the dialect extension to see the blinks. otherwise the post will default to the normal twitter-card.

**supporting wallets/extensions**

backpack

phantom (enable in settings under "experimental features")

solflare (soon)

dialect
