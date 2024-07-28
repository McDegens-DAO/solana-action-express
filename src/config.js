'use strict';

// *********************************************************************************
// server settings
var host = "http://localhost"; // http://localhost or your live domain
var auto = "donate-usdc-config"; // dial.to test window : set false for prod
// server settings
// *********************************************************************************

// *********************************************************************************
// localhost dev actions.json rules 
var rules = {"rules":[
{"pathPattern":"/donate-sol-config","apiPath":host+"/donate-sol-config"},
{"pathPattern":"/donate-usdc-config","apiPath":host+"/donate-usdc-config"}
]};
// localhost dev actions.json rules 
// *********************************************************************************

// *********************************************************************************
// no edit
if(host.includes("localhost")){host=host+":3000";}
var rpc_file = "rpcs/rpcs.json"; // move to server root for prod
var rpc_id = 0; // 0 = first rpc url from the file above
import fs from 'fs';
var rpcs=JSON.parse(fs.readFileSync(rpc_file).toString());
var rpc=rpcs[rpc_id].url;
export var host, rpc_file, rpc_id, auto, protocol, rpcs, rpc, rules;
// no edit
// *********************************************************************************