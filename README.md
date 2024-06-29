# solana-action-express
solana actions server powered by node & express js

provides solana actions endpoints for solana blinks

repo support: [McDegens Discord](https://discord.gg/Z9bUEf8gYb)

featured at: [Awesome Solana Blinks](https://github.com/solana-developers/awesome-blinks/blob/master/README.md)

live blink: [On Dialect](https://dial.to/?action=solana-action:https://actions.mcdegen.xyz:8444/mint-config)

![solana blink](https://github.com/McDegens-DAO/solana-action-express/blob/main/blink.png)

# auto install and start
installs and starts the server
```javascript
git clone https://github.com/McDegens-DAO/solana-action-express.git && mv solana-action-express/* . && npm install && npm run actions
```

# normal start
```javascript
npm run actions
```

# rendering on x
it's important to note that in order for a blink to render on x, the page you're sharing (i.e. yourwebsite.xyz/donate) must have twitter-card metatags. we used the following tags:
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

Dialect Action Registration: https://dial.to/register

# x users
users on x need to have a supporting wallet or the dialect extension to see the blinks. otherwise the post will default to the normal twitter-card.

**supporting wallets/extensions**

phantom wallet (enable in settings under "experimental features")

solflare wallet (soon)

backpack wallet

dialect blinks [web store](https://chromewebstore.google.com/detail/dialect-blinks/mhklkgpihchphohoiopkidjnbhdoilof) 

# non-node web apps
if the twitter-card metatags for your blink are located on a non-node website, blog, one the many oss ecom platforms, anything running on apache, you can use this php file in place of your actions.json to allow public access from blink clients without opening up cross domain requests to other files on your system. you will also need to add a RewriteRule in your your .htaccess file to route all requests for actions.json to the actions.php file.

**actions.php**
```javascript
<?php header("Access-Control-Allow-Origin:*");header('Access-Control-Max-Age:86400');header('Content-Type:application/json');
header("Access-Control-Allow-Methods:GET");if(isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS'])){header("Access-Control-Allow-Headers:{$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");}$response=new stdClass;$rules=array();$rule=new stdClass;
//// define rules below

// ***************************************************************
// repeat for each rule
$rule->pathPattern = "/donate*";
$rule->apiPath = "https://actions.mcdegen.xyz:8444/donate-config";
$rules[] = $rule;
// ***************************************************************

/// output data
$response->rules=$rules;echo json_encode($response);exit();
```
**.htaccess**
```javascript
RewriteEngine On
RewriteBase /
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
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
