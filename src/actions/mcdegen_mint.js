// 'use strict';
// *********************************************************************************
// cnft minter action
import {rpc,host} from '../config.js';
import {Connection,PublicKey,Keypair,SystemProgram,TransactionInstruction} from "@solana/web3.js";
import BufferLayout from "@solana/buffer-layout";
import BN from "bn.js";
import mcbuild from '../mcbuild/mcbuild.js';
import Express from 'express';
var mcdegen_mint = Express.Router();
const publicKey=(property="publicKey")=>{return BufferLayout.blob(32,property);}
const uint64=(property="uint64")=>{return BufferLayout.blob(8,property);}
// *********************************************************************************

// *********************************************************************************
// custom structs
const MCDEGENS_PROGRAM_STATE = BufferLayout.struct([
    BufferLayout.u8("is_initialized"),
    uint64("next_paid_index"),
    uint64("next_index"),
    uint64("max"),
    publicKey("merkle_tree"),
    publicKey("collection_mint"),
    publicKey("collection_metadata"),
    publicKey("collection_master_edition"),
    uint64("fee_lamports"),
    publicKey("mcdegens_treasury"),
    publicKey("artist_treasury"),
    uint64("default_per_wallet"),
    uint64("default_time_limit"),
    BufferLayout.u8("whitelist_only"),
    BufferLayout.u8("whitelist_discount"),
]);
// *********************************************************************************

// *********************************************************************************
// mint config 
mcdegen_mint.get('/mcdegen-mint-config',(req,res)=>{
    let obj = {}
    obj.icon = "https://mcdegen.xyz/images/pfp-416.png";
    obj.title = "Mint (0.15 SOL)";
    obj.description = "Mint a McDegen NFT here!";
    obj.label = "Mint";
    obj.links = {
    "actions": [
      {
        "label": "Mint",
        "href": host+"/mcdegen-mint-build?priority=High",
      }
    ]}
    res.send(JSON.stringify(obj));
});
// *********************************************************************************

// *********************************************************************************
// mint tx 
mcdegen_mint.route('/mcdegen-mint-build').post(async function(req,res){
    let obj = {}

    // validate inputs or default for simulation
    if(typeof req.body.account=="undefined"){req.body.account="7Z3LJB2rxV4LiRBwgwTcufAWxnFTVJpcoCMiCo8Z5Ere";}
    if(typeof req.query.priority=="undefined" || isNaN(req.query.priority)){req.query.priority="High";}
    console.log("req.body.account", req.body.account);
    console.log("req.query.priority", req.query.priority);

    // create custom transaction below
    let connection = new Connection(rpc, "confirmed");
    let program = new PublicKey("Aui35pLMPZQY6pUfkjVKVHuHSsJyCwQ8pWPKx7Ra19Q1");
    let data = false;
    let account = req.body.account;
    let wallet = new PublicKey(account);
    let programStatePDA = PublicKey.findProgramAddressSync([Buffer.from("program-state")],program);
    let programState = null;
    programState = await connection.getAccountInfo(programStatePDA[0]).catch(function(){
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify("program state error"));
    });
    let feeLamports = null;
    let mcDegensTreasury = null;
    let whitelistOnly = null;
    let whitelistDiscount = null;
    let totalFee = null;
    if (programState != null) {
        const encodedProgramStateData = programState.data;
        const decodedProgramStateData = MCDEGENS_PROGRAM_STATE.decode(encodedProgramStateData);
        feeLamports = new BN(decodedProgramStateData.fee_lamports, 10, "le");
        totalFee = parseInt(feeLamports);
        mcDegensTreasury = new PublicKey(decodedProgramStateData.mcdegens_treasury);
        if (new BN(decodedProgramStateData.whitelist_only, 10, "le")==0) {whitelistOnly=false;}else{whitelistOnly=true;}
        whitelistDiscount = new BN(decodedProgramStateData.whitelist_discount, 10, "le");
    }
    let walletStatePDA = PublicKey.findProgramAddressSync([Buffer.from("wallet-state"),wallet.toBytes()], program);  
    if (whitelistOnly === true) {totalFee = parseInt(feeLamports * (whitelistDiscount / 100));}    
    let tempFeeAccount = new Keypair();
    let createTempFeeAccountIx = SystemProgram.createAccount({
        programId: program,
        space: 0,
        lamports: totalFee,
        fromPubkey: wallet,
        newAccountPubkey: tempFeeAccount.publicKey,
    });
    let receiptStatePDA = PublicKey.findProgramAddressSync([Buffer.from("receipt-state"),wallet.toBytes(),tempFeeAccount.publicKey.toBytes()],program);
    let totalSize = 1;
    let uarray = new Uint8Array(totalSize);
    let counter = 0;
    uarray[counter++] = 5; // 5 = cnft_minter PayForMint instruction
    data = Buffer.from(uarray);
    let keys = [
        { pubkey: wallet, isSigner: true, isWritable: true }, // 0
        { pubkey: programStatePDA[0], isSigner: false, isWritable: true }, // 1
        { pubkey: walletStatePDA[0], isSigner: false, isWritable: true }, // 2
        { pubkey: tempFeeAccount.publicKey, isSigner: true, isWritable: true }, // 3
        { pubkey: receiptStatePDA[0], isSigner: false, isWritable: true }, // 4
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }, // 5
        { pubkey: mcDegensTreasury, isSigner: false, isWritable: true }, // 6
    ];
    let mintIx = new TransactionInstruction({programId: program, data: data, keys: keys});
    let instructions = [ createTempFeeAccountIx, mintIx ];
    ///
    let _tx_ = {};
    _tx_.rpc = rpc;
    _tx_.account = account;
    _tx_.signers = [ tempFeeAccount ];
    _tx_.serialize = true;
    _tx_.encode = true;
    _tx_.table = false;
    _tx_.tolerance = 1.2;
    _tx_.priority = req.query.priority;
    _tx_.instructions = instructions;
    _tx_.compute = false;
    _tx_.fees = false;
    let tx = await mcbuild.tx(_tx_);
    ///
    res.send(JSON.stringify(tx));
});
export {mcdegen_mint};
// *********************************************************************************