'use strict';
// *********************************************************************************
// server settings
var port = 3001; // try 8444 for prod
var server_host = "http://localhost"; // https fqd required for prod
var primary_app = "https://dev.mcswap.xyz"; // main app
var ssl_crt = ""; // path to crt file required for prod
var ssl_key = ""; // path to ssl key required for prod
var rpc_file = "rpcs/helius.json"; // move to server root for prod
var rpc_id = 0; // 0 = first rpc url from the file above
var auto_open = "donate-usdc-config"; // dial.to dev test window : set false for prod
var rules = {"rules":[{"pathPattern":"/donate-usdc-config","apiPath":server_host+":"+port+"/"+auto_open}]};
// var auto_open = false; // dial.to dev test window : set false for prod
// *********************************************************************************

// *********************************************************************************
var http_port=":"+port;var protocol;var proto;import fs from 'fs';import http from 'http';import https from 'https';if(server_host.includes("https:")){protocol=https;proto="https";}else{protocol=http;proto="http";}var rpcs=JSON.parse(fs.readFileSync(rpc_file).toString());var rpc=rpcs[rpc_id].url;
export var port, server_host, primary_app, ssl_crt, ssl_key, rpc_file, rpc_id, auto_open, http_port, protocol, proto, rpcs, rpc, rules;
// *********************************************************************************
