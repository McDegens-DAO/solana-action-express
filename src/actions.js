// *********************************************************************************
// name: solana-action-express
// author: @SolDapper
// repo: github.com/McDegens-DAO/solana-action-express
// *********************************************************************************

// *********************************************************************************
// initialize server
import {port,server_host,ssl_crt,ssl_key,auto_open,http_port,proto} from './config.js';
import fs from 'fs';
import open from 'open';
import http from 'http';
import https from 'https';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
const app = express(); 
app.use(bodyParser.json()); 
app.use(cors({origin:true}));
app.use(function(req,res,next) {
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Encoding, Accept-Encoding');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Content-Encoding', 'compress');
  res.setHeader('Content-Type', 'application/json');
  next();
});
// initialize server
// *********************************************************************************

// *********************************************************************************
// include actions
import { donation_sol } from './actions/donation_sol.js';
app.use("/", donation_sol);
import { donation_usdc } from './actions/donation_usdc.js';
app.use("/", donation_usdc);
// include actions
// *********************************************************************************

// *********************************************************************************
app.get("/actions.json",(req,res)=>{if(server_host=="http://localhost" && auto_open!=false){res.send(JSON.stringify(rules));}});app.get("/",(req,res)=>{res.send(JSON.stringify('solana-action-express is running on '+proto+http_port));});let server=null;if(proto=="https"){const credentials={key:fs.readFileSync(ssl_key,'utf8'),cert:fs.readFileSync(ssl_crt,'utf8')};server=https.createServer(credentials,app);}else{server=http.createServer(app);};server.listen(port,()=>{console.log('solana-action-express is running on '+proto+http_port);if(server_host=="http://localhost" && auto_open!=false){open("https://dial.to/?action=solana-action:http://localhost"+http_port+"/"+auto_open);}});
