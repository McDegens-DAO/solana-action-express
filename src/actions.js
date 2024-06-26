// *********************************************************************************
// name: solana-action-express
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
// transaction packager
class mcbuild {
    static async status(cluster,sig,max=10,int=4){
        return await new Promise(resolve => {
            let start = 1;
            let connection = null;
            connection = new Connection(cluster, "confirmed");
            let intervalID = setInterval(async()=>{
            let tx_status = null;
            tx_status = await connection.getSignatureStatuses([sig], {searchTransactionHistory: true,});
            console.log(start+": "+sig);
            if (tx_status != null && typeof tx_status.value != "undefined"){ 
                console.log(tx_status.value);
            }
            else{
                console.log("failed to get status...");
            }
            if (tx_status == null || 
            typeof tx_status.value == "undefined" || 
            tx_status.value == null || 
            tx_status.value[0] == null || 
            typeof tx_status.value[0] == "undefined" || 
            typeof tx_status.value[0].confirmationStatus == "undefined"){} 
            else if(tx_status.value[0].confirmationStatus == "processed"){
                start = 1;
            }
            else if(tx_status.value[0].confirmationStatus == "confirmed"){
                start = 1;
            }
            else if (tx_status.value[0].confirmationStatus == "finalized"){
                if(tx_status.value[0].err != null){
                resolve('program error!');
                clearInterval(intervalID);
                }
                resolve('finalized');
                clearInterval(intervalID);
            }
            start++;
            if(start == max + 1){
                resolve((max * int)+' seconds max wait reached');
                clearInterval(intervalID);
            }
            },(int * 1000));
        });  
    }
    static async ComputeLimit(cluster,opti_payer,opti_ix,opti_tolerance,opti_tables=false){
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
    static async FeeEstimate(cluster,payer,priorityLevel,instructions,tables=false){
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
    static async tx(_data_){
    let _obj_={};let _rpc_;let _account_;let _instructions_;let _signers_;let _priority_;let _tolerance_;let _serialize_;let _encode_;let _table_;let _compute_;let _fees_;
    if(typeof _data_.rpc=="undefined"){_obj_.transaction="mcbuild error";_obj_.message="missing rpc";return _obj_;}else{_rpc_=_data_.rpc;}
    if(typeof _data_.account=="undefined"){_obj_.transaction="mcbuild error";_obj_.message="missing account";return _obj_;}else{_account_=_data_.account;}
    if(typeof _data_.instructions=="undefined"){_obj_.transaction="mcbuild error";_obj_.message="missing instructions";return _obj_;}else{_instructions_=_data_.instructions;}
    if(typeof _data_.signers=="undefined"){_signers_=false;}else{_signers_=_data_.signers;}
    if(typeof _data_.priority=="undefined"){_priority_="Medium";}else{_priority_=_data_.priority;}
    if(typeof _data_.tolerance=="undefined"){_tolerance_="1.1";}else{_tolerance_=_data_.tolerance;}
    if(typeof _data_.serialize=="undefined"){_serialize_=false;}else{_serialize_=_data_.serialize;}
    if(typeof _data_.encode=="undefined"){_encode_=false;}else{_encode_=_data_.encode;}
    if(typeof _data_.tables=="undefined"){_table_=false;}else{_table_=_data_.tables;}
    if(typeof _data_.compute=="undefined"){_compute_=true;}else{_compute_=_data_.compute;}
    if(typeof _data_.fees=="undefined"){_fees_=true;}else{_fees_=_data_.fees;}
    let _wallet_= new PublicKey(_account_);
    let connection= new Connection(_rpc_,"confirmed");
    if(_priority_=="Extreme"){_priority_="VeryHigh";}
    let _payer_={publicKey:_wallet_}
    if(_compute_ != false){
        let _cu_ = null;
        _cu_= await this.ComputeLimit(_rpc_,_payer_,_instructions_,_tolerance_,_table_);
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
        _instructions_.unshift(ComputeBudgetProgram.setComputeUnitLimit({units:_cu_}));
        }
        if(_fees_ != false){
            let get_priority = await this.FeeEstimate(_rpc_,_payer_,_priority_,_instructions_,_table_);
            _instructions_.unshift(ComputeBudgetProgram.setComputeUnitPrice({microLamports:get_priority}));
        }
        let _message_=null;
        let _blockhash_ = (await connection.getRecentBlockhash('confirmed')).blockhash;
        if(_table_!=false){
            _message_= new TransactionMessage({payerKey:_wallet_,recentBlockhash:_blockhash_,instructions:_instructions_,}).compileToV0Message(_table_);
        }
        else{
            _message_= new TransactionMessage({payerKey:_wallet_,recentBlockhash:_blockhash_,instructions:_instructions_,}).compileToV0Message([]);
        }
        let _tx_= new VersionedTransaction(_message_);
        if(_signers_!=false){
            _tx_.sign(_signers_);
        }
        if(_serialize_ === true){
            _tx_=_tx_.serialize();
        }
        if(_encode_ === true){
            _tx_= Buffer.from(_tx_).toString("base64");
        }
        if(_serialize_ == false || _encode_ == false){
            _obj_ = _tx_;
        }
        else{
            _obj_.message="success";
            _obj_.transaction=_tx_;
        }
        return _obj_;
    }
}
// *********************************************************************************


////////////////////////////// DONATE ACTION ///////////////////////////////////////
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
          "href": server_host+port+"/"+name+"-build?amount={amount}&priority=High",
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
    let err = {}
    if(typeof req.body.account == "undefined"){
      err.transaction = "error";
      err.message = "action did not receive an account";
      res.send(JSON.stringify(err));
    }
    else if(typeof req.query.amount == "undefined"){
      err.transaction = "error";
      err.message = "action did not receive an amount to send";
      res.send(JSON.stringify(err));
    }

    // create instructions
    let lamports = req.query.amount * 1000000000;
    let from = new PublicKey(req.body.account);
    let to = new PublicKey("GUFxwDrsLzSQ27xxTVe4y9BARZ6cENWmjzwe8XPy7AKu");
    let donateIx = SystemProgram.transfer({fromPubkey:from, lamports:lamports, toPubkey:to});
    // create instructions

    // build transaction
    let _tx_ = {};
    _tx_.rpc = rpc;                     // string : required
    _tx_.account = req.body.account;    // string : required
    _tx_.instructions = [ donateIx ];   // array  : required
    _tx_.signers = false;               // array  : default false
    _tx_.serialize = true;              // bool   : default false
    _tx_.encode = true;                 // bool   : default false
    _tx_.table = false;                 // bool   : default false
    _tx_.tolerance = 2;                 // int    : default 1.1    
    _tx_.compute = false;               // bool   : default true
    _tx_.fees = true;                   // bool   : default true
    _tx_.priority = req.query.priority; // string : VeryHigh,High,Medium,Low,Min : default Medium
    let tx = await mcbuild.tx(_tx_);
    // build transaction
   
    res.send(JSON.stringify(tx));
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
console.log('solana-actions-express running on port '+https_port);
// ******************************************************************************
