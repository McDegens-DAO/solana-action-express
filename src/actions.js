// *********************************************************************************
// name: solana-action-express
// author: Dapper : @SolDapper
// repo: github.com/McDegens-DAO/solana-action-express
// *********************************************************************************

// *********************************************************************************
// server settings
let port = 3001; // try 8444 for prod
const server_host = "http://localhost"; // https required for prod
const primary_app = "https://mcdegen.xyz"; // not currently used
const ssl_crt = ""; // path to crt file required for prod
const ssl_key = ""; // path to ssl key required for prod
const rpc_file = "rpcs/helius.json"; // move to server root for prod
const rpc_id = 0; // 0 = first rpc url from the file above
const auto_open = "donate-config"; // dial.to dev test window : set false for prod
// *********************************************************************************

// *********************************************************************************
// import modules
import {Connection,Transaction,Keypair,PublicKey,SystemProgram,ComputeBudgetProgram,TransactionInstruction,TransactionMessage,VersionedTransaction} from "@solana/web3.js";
import BufferLayout from "@solana/buffer-layout";
import fs from 'fs';
import BN from "bn.js";
import bs58 from 'bs58';
import mcbuild from './mcbuild.js';
const publicKey=(property="publicKey")=>{return BufferLayout.blob(32,property);}
const uint64=(property="uint64")=>{return BufferLayout.blob(8,property);}
// *********************************************************************************

// *********************************************************************************
// configures express web server 
let protocol; let host;
import open from 'open';
import http from 'http';
import https from 'https';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
const app=express(); app.use(bodyParser.json()); app.use(cors({origin:true}));
let http_port=":"+port; let proto; if(server_host.includes("https:")){protocol=https;proto="https";}
else{protocol=http;proto="http";} const rpcs=JSON.parse(fs.readFileSync(rpc_file).toString()); let rpc=rpcs[rpc_id].url;
app.use(function(req,res,next) {
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Encoding, Accept-Encoding');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Content-Encoding', 'compress');
  res.setHeader('Content-Type', 'application/json');
  next();
});
// *********************************************************************************


// *********************************************************************************
// donation blink config
app.get('/donate-config',(req,res)=>{
    let name = "donate";
    let obj = {}
    obj.icon = "https://mcdegen.xyz/images/pfp-416.png";
    obj.title = "Donate to McDegens DAO";
    obj.description = "Enter an amount of SOL and click Send";
    obj.label = "donate";
    obj.links = {
    "actions": [
        {
          "label": "Send",
          "href": server_host+http_port+"/"+name+"-build?amount={amount}",
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
// donation build tx 
app.route('/donate-build').post(async function(req,res){
    let err={};if(typeof req.body.account=="undefined"){err.transaction="error";err.message="action did not receive an account";res.send(JSON.stringify(err));}
    
    // verify amount param was passed
    if(typeof req.query.amount=="undefined"){err.transaction="error";
      err.message = "action did not receive an amount to send";
      res.send(JSON.stringify(err));
    }

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
// *********************************************************************************


// *********************************************************************************
app.get("/actions.json",(req,res)=>{let actions=JSON.parse(fs.readFileSync('actions.json','utf8'));res.send(JSON.stringify(actions));});app.get("/",(req,res)=>{res.send(JSON.stringify('solana-action-express is running on '+proto+http_port));});let server=null;if(proto=="https"){const credentials={key:fs.readFileSync(ssl_key,'utf8'),cert:fs.readFileSync(ssl_crt,'utf8')};server=https.createServer(credentials,app);}else{server=http.createServer(app);};server.listen(port,()=>{console.log('solana-action-express is running on '+proto+http_port);if(server_host=="http://localhost" && auto_open!=false){open("https://dial.to/?action=solana-action:http://localhost"+http_port+"/"+auto_open);}});
