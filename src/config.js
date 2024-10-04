'use strict';
import 'dotenv/config'

// *********************************************************************************
// server settings
var host = ""; // your live domain
host = "http://localhost"; // comment out before production deployment
var auto = "mcswap"; // dial.to test window : ignored in production
// *********************************************************************************

// *********************************************************************************
// no edit
if(host.includes("localhost")){host=host+":3000";}
// *********************************************************************************

// *********************************************************************************
// localhost dev actions.json rules 
var rules = {"rules":[
{"pathPattern":"/donate-usdc-config","apiPath":host+"/donate-usdc-config"},
{"pathPattern":"/donate-sol-config","apiPath":host+"/donate-sol-config"},
{"pathPattern":"/mcswap-nft-create","apiPath":host+"/mcswap-nft-create"},
{"pathPattern":"/mcswap-pnft-create","apiPath":host+"/mcswap-pnft-create"},
{"pathPattern":"/mcswap-cnft-create","apiPath":host+"/mcswap-cnft-create"},
{"pathPattern":"/mcswap-core-create","apiPath":host+"/mcswap-core-create"},
{"pathPattern":"/mcswap-spl-create","apiPath":host+"/mcswap-spl-create"},
{"pathPattern":"/mcswap","apiPath":host+"/mcswap"},
]};
// *********************************************************************************

// *********************************************************************************
// no edit
var rpc_file = "rpcs/rpcs.json"; // move to server root for prod
var rpc_id = 0; // 0 = first rpc url from the file above
var rpc;
import fs from 'fs';
if(process.env.RPC){rpc=process.env.RPC;}
else{var rpcs=JSON.parse(fs.readFileSync(rpc_file).toString());rpc=rpcs[rpc_id].url;}
export var host, auto, rpc, rules;
// no edit
// *********************************************************************************