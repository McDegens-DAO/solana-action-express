# solana-action-express
solana actions server powered by node & express js

provides modular action endpoints for solana blinks

support: contact [@SolDapper](https://x.com/SolDapper) or [McDegens Discord](https://discord.gg/Z9bUEf8gYb)

featured at: [Awesome Solana Blinks](https://github.com/solana-developers/awesome-blinks/blob/master/README.md)

our live mint blink: [On Dialect](https://dial.to/?action=solana-action:https://www.solana-action-express.com/mcdegen-mint-config)

the default action for this repo is a usdc (or other spl) donation blink. however there is a sol donation action included as well.

![solana blink](https://github.com/McDegens-DAO/solana-action-express/blob/main/blink.png)

# auto install and start
installs and starts the server

*this command creates the your-projects/solana-action-express working directory
```javascript
git clone https://github.com/McDegens-DAO/solana-action-express.git && cd solana-action-express && npm install && npm run actions
```

# normal start
```javascript
npm run actions
```

# creating new actions
1. create your new action file
```javascript
touch src/actions/my_new_action.js
```
2. include the new file into your [actions.js](https://github.com/McDegens-DAO/solana-action-express/blob/a5b8883a90303b31030f9cbc941a2b4ffbc22f27/src/actions.js#L32)
```javascript
// *********************************************************************************
// include actions
import { my_new_action } from './actions/my_new_action.js';
app.use("/", my_new_action);
import { donation_sol } from './actions/donation_sol.js';
app.use("/", donation_sol);
import { donation_usdc } from './actions/donation_usdc.js';
app.use("/", donation_usdc);
// include actions
// *********************************************************************************
```
3. build your new action module

 *src/actions/my_new_action.js*
```javascript
'use strict';
// *********************************************************************************
// sol donation action
import {rpc,server_host,http_port} from '../config.js';
import Express from 'express';
var my_new_action = Express.Router();
my_new_action.get('/my-new-action-config',(req,res)=>{
    let obj = {}
    obj.icon = "";
    obj.title = "";
    obj.description = "";
    obj.label = "donate";
    obj.links = {
    "actions": [
        {
          "label": "Send",
          "href": host+"/my-new-action-build?amount={amount}",
          "parameters": [
            {
              "name": "amount", // input field name
              "label": "SOL Amount", // text input placeholder
            }
          ]
        }
      ]
    }
    res.send(JSON.stringify(obj));
});
// *********************************************************************************

// *********************************************************************************
// sol donation tx
my_new_action.route('/my-new-action-build').post(async function(req,res){
  let err={};

  // validate inputs or default for simulation
  if(typeof req.body.account=="undefined"){req.body.account="7Z3LJB2rxV4LiRBwgwTcufAWxnFTVJpcoCMiCo8Z5Ere";}
  if(typeof req.query.amount=="undefined" || req.query.amount=="<amount>" || isNaN(req.query.amount)){req.query.amount = 0;}
  console.log("req.body.account", req.body.account);
  console.log("req.query.amount", req.query.amount);

  // create instructions
  let lamports = req.query.amount * 1000000000;
  let from = new PublicKey(req.body.account);
  let to = new PublicKey("GUFxwDrsLzSQ27xxTVe4y9BARZ6cENWmjzwe8XPy7AKu");
  let donateIx = SystemProgram.transfer({fromPubkey:from, lamports:lamports, toPubkey:to});

  // build transaction
  let _tx_ = {};
  _tx_.rpc = rpc;                     // string : required
  _tx_.account = req.body.account;    // string : required
  _tx_.instructions = [ donateIx ];   // array  : required
  _tx_.signers = false;               // array  : default false
  _tx_.serialize = true;              // bool   : default false
  _tx_.encode = true;                 // bool   : default false
  _tx_.table = false;                 // array  : default false
  _tx_.tolerance = 2;                 // int    : default 1.1    
  _tx_.compute = false;               // bool   : default true
  _tx_.fees = false;                  // bool   : default true : helius rpc required when true
  _tx_.priority = req.query.priority; // string : VeryHigh,High,Medium,Low,Min : default Medium
  let tx = await mcbuild.tx(_tx_);    // package the tx
  res.send(JSON.stringify(tx));       // output

});
export {my_new_action};
// *********************************************************************************
```

# cloud deployment
by default your "host" is localhost. when deploying your server live you must update the host setting in [src/config.js](https://github.com/McDegens-DAO/solana-action-express/blob/main/src/config.js) to your live domain name and set "auto" to false.
```javascript
var host = "https://your-domain-name.com";
var auto = false;
```
[heroku](https://www.heroku.com) hosting conviennently allows you to auto deploy or manually deploy from your github repo with one click.

# rendering on x
Although you can test locally on Dial.to and other tools, it's important to note that in order for a blink to render on x.com you must have:
1. your actions deployed live on a fully qualified domain name.
2. blinks must be enabled in your wallet settings.
3. the page you're sharing must have twitter-card metatags.

we use the following metatags
```javascript
  <title>Title</title>
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
  <link rel="apple-touch-icon" href="" type="image/png">
  <link rel="icon" href="" type="image/png">
```
you can test that your page is twitter-card enabled using this tool:

https://www.bannerbear.com/tools/twitter-card-preview-tool/

# actions registration
It is currently necessary to register the domain of your actions server or else your blinks will not render on x.

Dialect Action Registration: https://dial.to/register

# x users
users on x need to have a supporting wallet or the dialect extension to see the blinks. otherwise the post will default to the normal twitter-card.

**supporting wallets/extensions**

phantom wallet (enable in settings under "experimental features") [web store](https://chromewebstore.google.com/detail/phantom/bfnaelmomeimhlpmgjnjophhpkkoljpa)

solflare wallet (soon)

backpack wallet [web store](https://chromewebstore.google.com/detail/backpack/aflkmfhebedbjioipglgcbcmnbpgliof)

dialect blinks [web store](https://chromewebstore.google.com/detail/dialect-blinks/mhklkgpihchphohoiopkidjnbhdoilof) 

# non-node web apps
if the twitter-card metatags for your blink are located on a non-node website, blog, one the many oss ecom platforms, anything running on apache, you can use this php file in place of your actions.json to allow public access from blink clients without opening up cross domain requests to other files on your system. you will also need to add a RewriteRule in your your .htaccess file to route all requests for actions.json to the actions.php file.

**actions.php**
```javascript
<?php header("Access-Control-Allow-Origin:*");header('Access-Control-Max-Age:86400');header('Content-Type:application/json');
header("Access-Control-Allow-Methods:GET");if(isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS'])){header("Access-Control-Allow-Headers:{$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");}$response=new stdClass;$rules=array();$rule=new stdClass;
// define rules below

// ***************************************************************
// repeat for each rule
$rule->pathPattern = "/donate*";
$rule->apiPath = "https://www.your-domain.com/my-new-action-config";
$rules[] = $rule;
// ***************************************************************

// output data
$response->rules=$rules;echo json_encode($response);exit();
```
**.htaccess**
```javascript
RewriteRule ^actions.json$ actions.php [L]
```
testing a request to yourwebsite.com/actions.json should respond with these headers
```javascript
Date: Fri, 28 Jun 2024 00:21:13 GMT
Server: Apache
Access-Control-Allow-Origin: *
Access-Control-Max-Age: 86400
Access-Control-Allow-Methods: GET
Transfer-Encoding: chunked
Content-Type: application/json
```

# official solana actions docs

https://solana.com/docs/advanced/actions

https://github.com/solana-developers/solana-actions
