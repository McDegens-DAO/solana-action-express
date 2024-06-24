// *********************************************************************************
// name: solana-actions-express
// author: Dapper (@SolDapper)
// repo: https://github.com/McDegens-DAO/solana-action-express
// *********************************************************************************

// *********************************************************************************
// server settings
const https_port = 8444; //~ port 
const primary_app = ""; //~ https://mcdegen.xyz
const server_host = ""; //~ https://actions.mcdegen.xyz
const rpc_file = ""; //~ ../../../rpcs/helius.json
const rpc_id = 0; //~ default rpc selection from the file above
const ssl_crt = ""; //~ ../../../ssl/certs/YOUR_CERT_FILE.crt
const ssl_key = ""; //~ ../../../ssl/keys/YOUR_KEY_FILE.key
const tolerance = 1.2; //~ adds cu to txs in case the estimates are too low
const priority = "High"; //~ default tx priority
// *********************************************************************************

// *********************************************************************************
// import modules
import { Connection, Transaction, Keypair, PublicKey, SystemProgram, ComputeBudgetProgram, TransactionInstruction, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import BufferLayout from "@solana/buffer-layout";
import * as splToken from "@solana/spl-token";
import fs from 'fs';
import BN from "bn.js";
import bs58 from 'bs58';
// *********************************************************************************

// *********************************************************************************
// configures express web server 
import https from 'https';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
const app = express(); // initialize server
app.use(bodyParser.json()); // receive posted data
app.use(cors({origin:true})); // open cors for all clients
let port = ""; if(https_port != false){port=":"+https_port}
// *********************************************************************************

// *********************************************************************************
// common
const publicKey=(property="publicKey")=>{return BufferLayout.blob(32,property);}
const uint64=(property="uint64")=>{return BufferLayout.blob(8,property);}
// *********************************************************************************

// *********************************************************************************
// sets default rpc variable
const rpcs = JSON.parse(fs.readFileSync(rpc_file).toString());
let rpc = rpcs[rpc_id].url;
// *********************************************************************************

// *********************************************************************************
// transaction builder class
class build {
    static async getComputeLimit(cluster,opti_payer,opti_ix,opti_tolerance,opti_tables=false){
        let connection = new Connection(cluster, 'confirmed');
        let opti_sim_limit = ComputeBudgetProgram.setComputeUnitLimit({units:1400000});
        let re_ix = [];
        for (let o in opti_ix) {re_ix.push(opti_ix[o]);}
        opti_ix = re_ix;
        opti_ix.unshift(opti_sim_limit);
        let opti_msg = null;
        if(opti_tables == false){
          opti_msg = new TransactionMessage({
            payerKey: opti_payer.publicKey,
            recentBlockhash: (await connection.getRecentBlockhash('confirmed')).blockhash,
            instructions: opti_ix,
          }).compileToV0Message([]);
        }
        else{
          opti_msg = new TransactionMessage({
            payerKey: opti_payer.publicKey,
            recentBlockhash: (await connection.getRecentBlockhash('confirmed')).blockhash,
            instructions: opti_ix,
          }).compileToV0Message([opti_tables]);
        }
        let opti_tx = new VersionedTransaction(opti_msg);    
        let opti_cu_res = await connection.simulateTransaction(opti_tx,{replaceRecentBlockhash:true,sigVerify:false,});
        console.log("Simulation Results: ", opti_cu_res.value);
        if(opti_cu_res.value.err != null){
          return {"transaction":"error","message":"error during simulation","logs":opti_cu_res.value.logs}
        }
        let opti_consumed = opti_cu_res.value.unitsConsumed;
        let opti_cu_limit = Math.ceil(opti_consumed * opti_tolerance);
        return opti_cu_limit;
    }
    static async getPriorityFeeEstimate(cluster,payer,priorityLevel,instructions,tables=false){
        let connection = new Connection(cluster,'confirmed',);
        let re_ix = [];
        for (let o in instructions) {re_ix.push(instructions[o]);}
        instructions = re_ix;
        let _msg = null;
        if(tables==false){
          _msg = new TransactionMessage({
            payerKey: payer.publicKey,
            recentBlockhash: (await connection.getRecentBlockhash('confirmed')).blockhash,
            instructions: instructions,
          }).compileToV0Message([]);
        }
        else{
          _msg = new TransactionMessage({
            payerKey: payer.publicKey,
            recentBlockhash: (await connection.getRecentBlockhash('confirmed')).blockhash,
            instructions: instructions,
          }).compileToV0Message([tables]);
        }
        let tx = new VersionedTransaction(_msg);
        let response = await fetch(cluster, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: "1",
            method: "getPriorityFeeEstimate",
            params: [
              {
                transaction: bs58.encode(tx.serialize()), // Pass the serialized transaction in Base58
                options: { priorityLevel: priorityLevel },
              },
            ],
          }),
        });
        let data = await response.json();
        console.log("estimate reponse:", data);
        data = parseInt(data.result.priorityFeeEstimate);
        if(data < 10000){data = 10000;}
        return data;
    }
    static async create(_rpc_,_account_,_instructions_,_signers_,_priority_=false,_tolerance_,_table_=false){
        let _obj_={}
        if(_priority_==false){_priority_=priority;}
        let _wallet_= new PublicKey(_account_);
        let connection= new Connection(_rpc_,"confirmed");
        // _instructions_=[_instructions_];
        if(_priority_=="Extreme"){_priority_="VeryHigh";}
        let _payer_={publicKey:_wallet_}
        let _cu_= null;
        _cu_= await this.getComputeLimit(_rpc_,_payer_,_instructions_,_tolerance_,_table_);
        if(typeof _cu_.logs != "undefined"){
            _cu_.transaction="error";
            _cu_.message="there was an error when simulating the transaction";
            return _cu_;
        }
        else if(_cu_==null){
            _obj_.transaction="error";
            _obj_.message="there was an error when optimizing compute limit";
            return _obj_;
        }
        else{
            _instructions_.unshift(ComputeBudgetProgram.setComputeUnitLimit({units:_cu_}));
            let get_priority = await this.getPriorityFeeEstimate(_rpc_,_payer_,_priority_,_instructions_,_table_);
            _instructions_.unshift(ComputeBudgetProgram.setComputeUnitPrice({microLamports:get_priority}));
            let _message_=null;
            let _blockhash_ = (await connection.getRecentBlockhash('confirmed')).blockhash;
            if(_table_!=false){
                _message_= new TransactionMessage({payerKey:_wallet_,recentBlockhash:_blockhash_,instructions:_instructions_,}).compileToV0Message([_table_]);
            }
            else{
                _message_= new TransactionMessage({payerKey:_wallet_,recentBlockhash:_blockhash_,instructions:_instructions_,}).compileToV0Message([]);
            }
            let _tx_= new VersionedTransaction(_message_);
            if(_signers_!=false){_tx_.sign(_signers_);}
            _tx_=_tx_.serialize();
            _tx_= Buffer.from(_tx_).toString("base64");
            _obj_.message="success";
            _obj_.transaction=_tx_;
            return _obj_;
        }
    }
}
// *********************************************************************************

////////////////////////////////////////////////////////////////////////////////////
// defines the initial config for this action and returns it to the blink ui
app.get('/donate-config',(req,res)=>{
    let name = "donate";
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Content-Encoding', 'compress');
    res.setHeader('Content-Type', 'application/json');
    let obj = {}
    obj.icon = "https://mcdegen.xyz/images/pfp-416.png";
    obj.title = "Donate to McDegens DAO";
    obj.description = "Enter an amount of SOL and click Send";
    obj.label = "donate";
    obj.links = {
    "actions": [
        {
          "label": "Send",
          "href": server_host+port+"/"+name+"-build?amount={amount}",
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
// builds, optimizes, serializes, base64 encodes, and sends a tx back to the blink
app.route('/donate-build').post(async function(req,res){
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Encoding, Accept-Encoding');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
    res.setHeader('Content-Encoding', 'compress');
    res.setHeader('Content-Type', 'application/json');
    let response = {}
    if(typeof req.body.account == "undefined"){
      response.transaction = "error";
      response.message = "action did not receive an account";
      res.send(JSON.stringify(response));
    }
    else if(typeof req.query.amount == "undefined"){
      response.transaction = "error";
      response.message = "action did not receive an amount to send";
      res.send(JSON.stringify(response));
    }
    if(typeof req.query.priority=="undefined"){req.query.priority=priority;}
    let table = false;
    let signers = false;
    let account = req.body.account;
    let lamports = req.query.amount * 1000000000;
    let from = new PublicKey(account);
    let to = new PublicKey("GUFxwDrsLzSQ27xxTVe4y9BARZ6cENWmjzwe8XPy7AKu"); // recipient
    let donateIx = SystemProgram.transfer({fromPubkey:from, lamports:lamports, toPubkey:to})
    let instructions = [ donateIx ];
    let tolerance = 2;
    let result = await build.create(rpc,account,instructions,signers,priority,tolerance,false);
    res.send(JSON.stringify(result));
});
////////////////////////////////////////////////////////////////////////////////////

// *********************************************************************************
// start the server
app.get('/ping', (req, res) => {res.setHeader('Content-Type', 'application/json'); res.send(JSON.stringify("ok"));});
const credentials = {
key:fs.readFileSync(ssl_key,'utf8'),
cert:fs.readFileSync(ssl_crt,'utf8')};
const httpsServer = https.createServer(credentials, app);
httpsServer.listen(https_port);
console.log('solana actions server running on port '+https_port);
// ******************************************************************************
