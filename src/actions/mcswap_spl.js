'use strict';
// *********************************************************************************
// mcswap spl
import {rpc,server_host,primary_app,http_port} from '../config.js';
import {Connection,PublicKey,SystemProgram,TransactionInstruction} from "@solana/web3.js";
import * as splToken from "@solana/spl-token";
import BN from "bn.js";
import mcbuild from '../mcbuild/mcbuild.js';
import {MCSWAP_SPL_PROGRAM,PIKL_MINT_ADDR,SPL_STATIC_ALT,PROGRAM_STATE_SPL,SWAP_SPL_STATE,commas} from '../programs/mcswap.js';
import Express from 'express';
var mcswap_spl = Express.Router();
// *********************************************************************************
// mcswap spl config
mcswap_spl.get('/mcswap-spl-config/*',async(req,res)=>{
  let _err_ = {};
  let request = (req.originalUrl).split("/");
  let last = request.length - 1;
  let ids = request[last].split("-");
  let user_a_key = new PublicKey(ids[0]);
  let user_b_key = new PublicKey(ids[1]);
  let connection = new Connection(rpc, "confirmed");
  let program = null;
  program = new PublicKey(MCSWAP_SPL_PROGRAM);
  let SPL_STATE_PDA = PublicKey.findProgramAddressSync([Buffer.from("swap-state"), user_a_key.toBytes(), user_b_key.toBytes()], program);
  let swapState = null;
  swapState = await connection.getAccountInfo(SPL_STATE_PDA[0]).catch(function(){_err_.message="failed to get swapState!";res.send(JSON.stringify(_err_));});
  let encodedSwapStateData = swapState.data;
  let decodedSwapStateData = SWAP_SPL_STATE.decode(encodedSwapStateData);
  let spl_initializer = new PublicKey(decodedSwapStateData.initializer);
  let spl_token1Mint = new PublicKey(decodedSwapStateData.token1_mint);
  let spl_token1Amount = new BN(decodedSwapStateData.token1_amount, 10, "le");
  let spl_tempToken1Account = new PublicKey(decodedSwapStateData.temp_token1_account);
  let spl_token2Mint = new PublicKey(decodedSwapStateData.token2_mint);
  let spl_token2Amount = new BN(decodedSwapStateData.token2_amount, 10, "le");
  let spl_tempToken2Account = new PublicKey(decodedSwapStateData.temp_token2_account);
  let spl_taker = new PublicKey(decodedSwapStateData.taker);
  let spl_token3Mint = new PublicKey(decodedSwapStateData.token3_mint);
  let spl_token3Amount = new BN(decodedSwapStateData.token3_amount, 10, "le");
  let spl_token4Mint = new PublicKey(decodedSwapStateData.token4_mint);
  let spl_token4Amount = new BN(decodedSwapStateData.token4_amount, 10, "le");
  let spl_metadata = null;
  let spl_decimals = null;
  let spl_symbol = null;       
  let spl_amount = null;    
  let spl_amt = null;
  let spl_multipy = 1;
  let receive = null;
  let send = null;
  let response = null;
  let info = null;
  let parserd_info = null;
  let pikl_fee = 0;
  // token 1
  if(spl_token1Mint.toString()=="DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"){spl_symbol = "BONK";}
  else{
    response = await fetch(rpc, {method: 'POST',headers: {"Content-Type": "application/json"},
      body: JSON.stringify({"jsonrpc": "2.0","id": "text","method": "getAsset","params":{"id":spl_token1Mint.toString()}})
    });
    spl_metadata = await response.json();
    spl_metadata = spl_metadata.result.content.metadata;
    spl_symbol = spl_metadata.symbol;
  }
  info = await connection.getParsedAccountInfo(spl_token1Mint);
  parserd_info = (info.value.data).parsed.info;
  spl_decimals = parseInt(parserd_info.decimals);
  spl_amount = parseInt(spl_token1Amount);
  for (let i = 0; i < spl_decimals; i++) {
    spl_multipy = spl_multipy * 10;
  }
  spl_amt = await commas(parseFloat(spl_amount/spl_multipy).toFixed(5));
  receive = spl_amt+" ("+spl_symbol+")";
  // token 2
  if(spl_token2Mint.toString() != "11111111111111111111111111111111"){
    if(spl_token2Mint.toString()=="DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"){spl_symbol = "BONK";}
    else{
      console.log(spl_token2Mint.toString());
      response = await fetch(rpc, {method: 'POST',headers: {"Content-Type": "application/json"},
        body: JSON.stringify({"jsonrpc": "2.0","id": "text","method": "getAsset","params":{"id":spl_token2Mint.toString()}})
      });
      spl_metadata = await response.json();
      spl_metadata = spl_metadata.result.content.metadata;
      spl_symbol = spl_metadata.symbol;
    }
    info = await connection.getParsedAccountInfo(spl_token2Mint);
    parserd_info = (info.value.data).parsed.info;
    spl_decimals = parseInt(parserd_info.decimals);
    spl_amount = parseInt(spl_token2Amount);
    spl_multipy = 1;
    for (let i = 0; i < spl_decimals; i++) {
      spl_multipy = spl_multipy * 10;
    }
    spl_amt = await commas(parseFloat(spl_amount/spl_multipy).toFixed(5));
    receive += " & "+spl_amt+" ("+spl_symbol+")";
  }
  // token 3
  if(spl_token3Mint.toString()=="DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"){spl_symbol = "BONK";}
  else{
    response = await fetch(rpc, {method: 'POST',headers: {"Content-Type": "application/json"},
      body: JSON.stringify({"jsonrpc": "2.0","id": "text","method": "getAsset","params":{"id":spl_token3Mint.toString()}})
    });
    spl_metadata = await response.json();
    console.log(spl_metadata);
    spl_metadata = spl_metadata.result.content.metadata;
    spl_symbol = spl_metadata.symbol;
  }
  info = await connection.getParsedAccountInfo(spl_token3Mint);
  parserd_info = (info.value.data).parsed.info;
  spl_decimals = parseInt(parserd_info.decimals);
  spl_amount = parseInt(spl_token3Amount);
  spl_multipy = 1;
  for (let i = 0; i < spl_decimals; i++) {
    spl_multipy = spl_multipy * 10;
  }
  spl_amt = await commas(parseFloat(spl_amount/spl_multipy).toFixed(5));
  send = spl_amt+" ("+spl_symbol+")";
  // token 4
  if(spl_token4Mint.toString() != "11111111111111111111111111111111"){
    if(spl_token4Mint.toString()=="DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"){spl_symbol = "BONK";}
    else{
      console.log(spl_token4Mint.toString());
      response = await fetch(rpc, {method: 'POST',headers: {"Content-Type": "application/json"},
        body: JSON.stringify({"jsonrpc": "2.0","id": "text","method": "getAsset","params":{"id":spl_token4Mint.toString()}})
      });
      spl_metadata = await response.json();
      spl_metadata = spl_metadata.result.content.metadata;
      spl_symbol = spl_metadata.symbol;
    }
    info = await connection.getParsedAccountInfo(spl_token4Mint);
    parserd_info = (info.value.data).parsed.info;
    console.log(parserd_info);
    spl_decimals = parseInt(parserd_info.decimals);
    spl_amount = parseInt(spl_token4Amount);
    spl_multipy = 1;
    for (let i = 0; i < spl_decimals; i++) {
      spl_multipy = spl_multipy * 10;
    }
    spl_amt = await commas(parseFloat(spl_amount/spl_multipy).toFixed(5));
    send += " & "+spl_amt+" ("+spl_symbol+")";
  }
  // pikl fee for mcswap protocol
  let SPL_FEE_PROGRAM = new PublicKey(MCSWAP_SPL_PROGRAM);
  let SPL_FEE_PROGRAM_PDA = PublicKey.findProgramAddressSync([Buffer.from("program-state")],SPL_FEE_PROGRAM);
  let SPL_FEE_PROGRAM_STATE = null;
  SPL_FEE_PROGRAM_STATE = await connection.getAccountInfo(SPL_FEE_PROGRAM_PDA[0]).catch(function(){});
  let encodedProgramStateData = SPL_FEE_PROGRAM_STATE.data;
  let decodedProgramStateData = PROGRAM_STATE_SPL.decode(encodedProgramStateData);
  pikl_fee = parseInt(new BN(decodedProgramStateData.fee_chips, 10, "le").toString());
  pikl_fee = pikl_fee/1000000000;
  pikl_fee = parseFloat(pikl_fee);
  pikl_fee = pikl_fee.toFixed(3);
  pikl_fee = await commas(pikl_fee);

  let contract_id = SPL_STATE_PDA[0].toString();
  let details = "Send: "+send+" From: "+user_b_key.toString()+" ........................................................................................................... ";
  details = details+"Receive: "+receive+" From: "+user_a_key.toString()+" ........................................................................................................... ";
  details = details+"Contract Id: "+contract_id+" ........................................................................................................... ";
  details = details+"Program: McSwap-SPL "+MCSWAP_SPL_PROGRAM+" ........................................................................................................... ";
  details = details+"Fee: Network + "+pikl_fee+" PIKL";
  let name = "mcswap-spl";
  let obj = {}
  obj.icon = primary_app+"/img/mcswap-card.png";
  obj.title = "OTC Contract";
  obj.description = details;
  obj.label = "execute";
  obj.links = {
  "actions": [
      {
        "label": "Execute Contract",
        "href": server_host+http_port+"/"+name+"-build/"+request[last],
      }
    ]
  }
  res.send(JSON.stringify(obj));
});
// mcswap spl tx 
mcswap_spl.route('/mcswap-spl-build/*').post(async function(req,res){
  let _err_={};if(typeof req.body.account=="undefined"){_err_.transaction="error";_err_.message="mcswap-spl-build action did not receive an account";res.send(JSON.stringify(_err_));}
  let request = (req.originalUrl).split("/");
  let last = request.length - 1;
  let ids = request[last].split("-");
  let user_a_key = new PublicKey(ids[0]);
  let user_b_key = new PublicKey(ids[1]);
  let connection = new Connection(rpc, "confirmed");
  let check_ata = null;

  // programState
  let pickleMint = null;
  let feeChips = null;
  let devTreasury = null;
  let mcDegensTreasury = null;
  let programState = null;
  let programStatePDA = PublicKey.findProgramAddressSync([Buffer.from("program-state")], new PublicKey(MCSWAP_SPL_PROGRAM));
  console.log("Program State PDA: ", programStatePDA[0].toString());
  programState = await connection.getAccountInfo(programStatePDA[0]);
  if (programState != null) {
    let encodedProgramStateData = programState.data;
    let decodedProgramStateData = PROGRAM_STATE_SPL.decode(encodedProgramStateData);
    console.log("programState - is_initialized: ", decodedProgramStateData.is_initialized);
    console.log("programState - pickle_mint: ", new PublicKey(decodedProgramStateData.pickle_mint).toString());
    console.log("programState - fee_chips: ", new BN(decodedProgramStateData.fee_chips, 10, "le").toString());
    console.log("programState - dev_percentage: ", new BN(decodedProgramStateData.dev_percentage, 10, "le").toString());
    console.log("programState - dev_treasury: ", new PublicKey(decodedProgramStateData.dev_treasury).toString());
    console.log("programState - mcdegens_treasury: ", new PublicKey(decodedProgramStateData.mcdegens_treasury).toString());
    pickleMint = new PublicKey(decodedProgramStateData.pickle_mint);
    feeChips = new BN(decodedProgramStateData.fee_chips, 10, "le");
    devTreasury = new PublicKey(decodedProgramStateData.dev_treasury);
    mcDegensTreasury = new PublicKey(decodedProgramStateData.mcdegens_treasury);
  } 
  else {
    _err_.transaction="error";
    _err_.message="Program State Not Initialized";
    res.send(JSON.stringify(_err_));
  }
  // programState

  // swapVaultPDA
  let swapVaultPDA = PublicKey.findProgramAddressSync([Buffer.from("swap-vault")], new PublicKey(MCSWAP_SPL_PROGRAM));
  console.log("Swap Vault PDA: ", swapVaultPDA[0].toString());
  // swapVaultPDA

  // swapState
  let SPL_STATE_PDA = PublicKey.findProgramAddressSync([Buffer.from("swap-state"), user_a_key.toBytes(), user_b_key.toBytes()], new PublicKey(MCSWAP_SPL_PROGRAM));
  let swapState = null;
  swapState = await connection.getAccountInfo(SPL_STATE_PDA[0]).catch(function(){
    _err_.transaction="error";
    _err_.message="Failed to get swapState";
    res.send(JSON.stringify(_err_));
  });
  let initializer = null;
  let token1Mint = null;
  let token1Amount = null;
  let tempToken1Account = null;
  let token2Mint = null;
  let token2Amount = null;
  let tempToken2Account = null;
  let taker = null
  let token3Mint = null;
  let token3Amount = null;
  let token4Mint = null;
  let token4Amount = null;
  let encodedSwapStateData = swapState.data;
  let decodedSwapStateData = SWAP_SPL_STATE.decode(encodedSwapStateData);
  initializer = new PublicKey(decodedSwapStateData.initializer);
  token1Mint = new PublicKey(decodedSwapStateData.token1_mint);
  token1Amount = new BN(decodedSwapStateData.token1_amount, 10, "le");
  tempToken1Account = new PublicKey(decodedSwapStateData.temp_token1_account);
  token2Mint = new PublicKey(decodedSwapStateData.token2_mint);
  token2Amount = new BN(decodedSwapStateData.token2_amount, 10, "le");
  tempToken2Account = new PublicKey(decodedSwapStateData.temp_token2_account);
  taker = new PublicKey(decodedSwapStateData.taker);
  token3Mint = new PublicKey(decodedSwapStateData.token3_mint);
  token3Amount = new BN(decodedSwapStateData.token3_amount, 10, "le");
  token4Mint = new PublicKey(decodedSwapStateData.token4_mint);
  token4Amount = new BN(decodedSwapStateData.token4_amount, 10, "le");
  token1Amount = parseInt(token1Amount);
  token2Amount = parseInt(token2Amount);
  token3Amount = parseInt(token3Amount);
  token4Amount = parseInt(token4Amount);
  console.log("token1Amount", token1Amount);
  console.log("token2Amount", token2Amount);
  console.log("token3Amount", token3Amount);
  console.log("token4Amount", token4Amount);
  // swapState

  // rent
  let rent = await connection.getMinimumBalanceForRentExemption(splToken.AccountLayout.span);
  console.log("rent", rent);
  // rent

  // providerPickleATA
  let providerPickleATA = await splToken.getAssociatedTokenAddress(new PublicKey(PIKL_MINT_ADDR),user_b_key,false,splToken.TOKEN_PROGRAM_ID,splToken.ASSOCIATED_TOKEN_PROGRAM_ID,);
  // providerPickleATA

  // providerToken3ATA
  let createTempToken3AccountIx = null;
  let initTempToken3AccountIx = null;
  let transferToken3Ix = null;
  let providerToken3ATA = providerPickleATA;
  providerToken3ATA = await splToken.getAssociatedTokenAddress(token3Mint,user_b_key,false,splToken.TOKEN_PROGRAM_ID,splToken.ASSOCIATED_TOKEN_PROGRAM_ID,);
  // providerToken3ATA

  // providerToken4ATA
  let providerToken4ATA = providerToken3ATA;
  if (parseInt(token4Amount.toString())>0){providerToken4ATA = await splToken.getAssociatedTokenAddress(token4Mint,user_b_key,false,splToken.TOKEN_PROGRAM_ID,splToken.ASSOCIATED_TOKEN_PROGRAM_ID,);}
  // providerToken4ATA

  // token1ATA
  let createToken1ATA = null;
  let createToken1ATAIx = null;
  let token1ATA = await splToken.getAssociatedTokenAddress(token1Mint,user_b_key,false,splToken.TOKEN_PROGRAM_ID,splToken.ASSOCIATED_TOKEN_PROGRAM_ID,);
  check_ata = null;
  check_ata = await connection.getAccountInfo(token1ATA).catch(function(err){});
  if(check_ata==null){
    createToken1ATA = true;
    createToken1ATAIx = splToken.createAssociatedTokenAccountInstruction(user_b_key,token1ATA,user_b_key,token1Mint,splToken.TOKEN_PROGRAM_ID,splToken.ASSOCIATED_TOKEN_PROGRAM_ID,);
  }else{createToken1ATA=false;}
  console.log("createToken1ATA ", createToken1ATA);
  // token1ATA

  // token2ATA
  let token2ATA = token1ATA;
  let createToken2ATA = null;
  let createToken2ATAIx = null;
  if (token2Amount > 0) {
    token2ATA = await splToken.getAssociatedTokenAddress(token2Mint,user_b_key,false,splToken.TOKEN_PROGRAM_ID,splToken.ASSOCIATED_TOKEN_PROGRAM_ID,);
    check_ata = null;
    check_ata = await connection.getAccountInfo(token2ATA).catch(function(err){});
    if(check_ata==null){
      createToken2ATA = true;
      createToken2ATAIx = splToken.createAssociatedTokenAccountInstruction(user_b_key,token2ATA,user_b_key,token2Mint,splToken.TOKEN_PROGRAM_ID,splToken.ASSOCIATED_TOKEN_PROGRAM_ID,);
    }else{createToken2ATA=false;}
  }else{createToken2ATA=false;}
  console.log("createToken2ATA ", createToken2ATA);
  // token2ATA

  // token3ATA
  let token3ATA = initializer;
  if (token3Mint.toString()!="11111111111111111111111111111111") {
    token3ATA = await splToken.getAssociatedTokenAddress(token3Mint,initializer,false,splToken.TOKEN_PROGRAM_ID,splToken.ASSOCIATED_TOKEN_PROGRAM_ID,);
  }
  // token3ATA

  // token4ATA
  let token4ATA = token3ATA;
  if (token4Amount>0) {
    token4ATA = await splToken.getAssociatedTokenAddress(token4Mint,initializer,false,splToken.TOKEN_PROGRAM_ID,splToken.ASSOCIATED_TOKEN_PROGRAM_ID,);
  }
  // token4ATA

  // data uarray
  let totalSize = 1;
  let uarray = new Uint8Array(totalSize);
  let counter = 0;
  uarray[counter++] = 1;
  // data uarray

  // keys
  let keys = [
    {
      pubkey: user_b_key,
      isSigner: true,
      isWritable: true
    }, // 0
    {
      pubkey: initializer,
      isSigner: false,
      isWritable: true
    }, // 1
    {
      pubkey: programStatePDA[0],
      isSigner: false,
      isWritable: false
    }, // 2
    {
      pubkey: swapVaultPDA[0],
      isSigner: false,
      isWritable: false
    }, // 3
    {
      pubkey: SPL_STATE_PDA[0],
      isSigner: false,
      isWritable: true
    }, // 4
    {
      pubkey: tempToken1Account,
      isSigner: false,
      isWritable: true
    }, // 5
    {
      pubkey: tempToken2Account,
      isSigner: false,
      isWritable: true
    }, // 6
    {
      pubkey: providerToken3ATA,
      isSigner: false,
      isWritable: true
    }, // 7  HERE
    {
      pubkey: providerToken4ATA,
      isSigner: false,
      isWritable: true
    }, // 8  HERE
    {
      pubkey: token1ATA,
      isSigner: false,
      isWritable: true
    }, // 9
    {
      pubkey: token2ATA,
      isSigner: false,
      isWritable: true
    }, // 10
    {
      pubkey: token3ATA,
      isSigner: false,
      isWritable: true
    }, // 11
    {
      pubkey: token4ATA,
      isSigner: false,
      isWritable: true
    }, // 12
    {
      pubkey: providerPickleATA,
      isSigner: false,
      isWritable: true
    }, // 13  HERE
    {
      pubkey: splToken.TOKEN_PROGRAM_ID,
      isSigner: false,
      isWritable: false
    }, // 14
    {
      pubkey: SystemProgram.programId,
      isSigner: false,
      isWritable: false
    }, // 15  HERE
    {
      pubkey: devTreasury,
      isSigner: false,
      isWritable: true
    }, // 16
    {
      pubkey: mcDegensTreasury,
      isSigner: false,
      isWritable: true
    }, // 17
  ]
  // keys

  // swapTokensIx
  let swapTokensIx = new TransactionInstruction({programId:new PublicKey(MCSWAP_SPL_PROGRAM),data:Buffer.from(uarray),keys:keys});
  // swapTokensIx

  // lookupTableAccount
  let lookupTable = new PublicKey(SPL_STATIC_ALT);
  let lookupTableAccount = await connection.getAddressLookupTable(lookupTable).then((res)=>res.value);
  if (!lookupTableAccount) {
    _err_.transaction="error";
    _err_.message="Failed to fetch Lookup Table";
    res.send(JSON.stringify(_err_));
  }
  // lookupTableAccount

  // instructions
  let instructions = [];
  if (createToken1ATA===true && createToken2ATA===true) {
    console.log("IX Type: 1");
    instructions = [createToken1ATAIx,createToken2ATAIx,swapTokensIx];
  } 
  else if (createToken1ATA===true) {
    console.log("IX Type: 2");
    instructions = [createToken1ATAIx,swapTokensIx];
  } 
  else if (createToken2ATA===true) {
    console.log("IX Type: 3");
    instructions = [createToken2ATAIx,swapTokensIx];
  } 
  else {
    console.log("IX Type: 4");
    instructions = [swapTokensIx];
  }
  // instructions

  // build transaction
  let _tx_ = {};
  _tx_.rpc = rpc;                     // string : required
  _tx_.account = req.body.account;    // string : required
  _tx_.instructions = instructions;   // array  : required
  _tx_.signers = false;               // array  : default false
  _tx_.serialize = true;              // bool   : default false
  _tx_.encode = true;                 // bool   : default false
  _tx_.table = [lookupTableAccount];  // array  : default false
  _tx_.tolerance = 1.5;               // int    : default 1.1 cu multiplier  
  _tx_.compute = false;               // bool   : default true
  _tx_.fees = false;                  // bool   : default true : helius rpc required when true
  _tx_.priority = req.query.priority; // string : VeryHigh,High,Medium,Low,Min : default Medium
  let tx = await mcbuild.tx(_tx_);    // package the tx
  res.send(JSON.stringify(tx));       // output
  // build transaction

});
export {mcswap_spl};
// *********************************************************************************