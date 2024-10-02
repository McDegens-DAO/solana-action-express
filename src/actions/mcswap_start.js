'use strict';
// *********************************************************************************
import {rpc,host} from '../config.js';
import mcswap from 'mcswap-js';
import Express from 'express';
import { MEMO_PROGRAM_ID } from "@solana/actions";
import { Connection, PublicKey, ComputeBudgetProgram, Transaction, TransactionInstruction } from '@solana/web3.js';
const mcswap_start = Express.Router();
const name = "mcswap";
const connection = new Connection(rpc,"confirmed");
const MemoTx = async(pubkey)=>{
    const transaction = new Transaction();
    transaction.feePayer = pubkey;
    transaction.add(ComputeBudgetProgram.setComputeUnitPrice({microLamports:1000}),
    new TransactionInstruction({programId:new PublicKey(MEMO_PROGRAM_ID),data:Buffer.from("Memo!","utf8"),keys:[]}));
    const {blockhash,lastValidBlockHeight} = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.lastValidBlockHeight = lastValidBlockHeight;
    const serializedTransaction = transaction.serialize({requireAllSignatures:false,verifySignatures:false});
    return serializedTransaction.toString('base64');
};
mcswap_start.all('/'+name,async(req,res)=>{
    const line = "\r\n";
    let details = "How would you like to continue?"+line;
    const obj = {}
    obj.type = "action";
    obj.links = {"actions":[
        {"label":"Sell a NFT Asset","href":host+"/"+name+"-next?choice=-nft-create"},
        {"label":"Sell a PNFT Asset","href":host+"/"+name+"-next?choice=-pnft-create"},
        {"label":"Sell a CNFT Asset","href":host+"/"+name+"-next?choice=-cnft-create"},
        {"label":"Sell a CORE Asset","href":host+"/"+name+"-next?choice=-core-create"},
        {"label":"Find a Contract","href":host+"/"+name+"-next?choice=-finder"}
    ]};
    obj.label = "McSwap";
    obj.icon = "https://mcswap.xyz/img/mcswap-card.png";
    obj.title = "McSwap OTC";
    obj.description = details;
    res.json(obj);
});
mcswap_start.route('/'+name+'-next').post(async(req,res)=>{
try{
    if(typeof req.body.account=="undefined"||req.body.account.includes("1111111111111111111111")){res.json(await mcswap.dummy(rpc));}
    else{
        if(req.query.choice=="home"){req.query.choice="";}
        const next = {next:{type:"post",href:host+"/"+name+req.query.choice}};
        const transaction = await MemoTx(new PublicKey(req.body.account));
        const payload = {transaction,message:"next",links:next};
        res.json(payload);
    }
}
catch(err){
    const _err_ = {};
    _err_.status="error";
    _err_.message="next step error";
    _err_.err=err;
    res.status(400).json(_err_);
}
});
mcswap_start.route('/'+name+'-finder').post(async(req,res)=>{
    const line = "\r\n";
    let details = "Fetch a list of active sent or received contracts for wallet."+line;
    const obj = {}
    obj.type = "action";
    const form = [
        {
            "name": "standard",
            "label": "Program",
            "type": "select",
            "required": true,
            "options": [
                {"label":"NFT","value":"NFT","selected":true},
                {"label":"PNFT","value":"PNFT","selected":false},
                {"label":"CNFT","value":"CNFT","selected":false},
                {"label":"CORE","value":"CORE","selected":false}                
            ]
        },
        {
            "name": "direction",
            "label": "Perspective",
            "type": "select",
            "required": true,
            "options": [
                {"label":"Received Contracts","value":"received","selected":true},
                {"label":"Sent Contracts","value":"sent"}
            ]
        },
        {
            "name": "wallet",
            "label": "Wallet (optional)",
        }
    ];
    obj.label = "Find";
    obj.links = {"actions":[
        {"label":"Find","href":host+"/"+name+"-find","parameters":form}
    ]};
    obj.icon = "https://mcswap.xyz/img/mcswap-card.png";
    obj.title = "Contract Finder";
    obj.description = details;
    res.json(obj);
});
mcswap_start.route('/'+name+'-find').post(async(req,res)=>{
try{
    if(typeof req.body.account=="undefined"||req.body.account.includes("1111111111111111111111")){res.json(await mcswap.dummy(rpc));}
    else{
        const body = req.body.data;
        if(typeof body.wallet=="undefined"){body.wallet=req.body.account;}
        const params = {"rpc":rpc}
        params.wallet = body.wallet; // required buyer wallet
        params.display = true; // optional convert units to decimals in response
        let Result = [];
        if(body.direction=="received"){
            if(body.standard=="NFT"){
                Result = await mcswap.nftReceived(params);
            }
            else if(body.standard=="PNFT"){
                Result = await mcswap.pnftReceived(params);
            }
            else if(body.standard=="CNFT"){
                Result = await mcswap.cnftReceived(params);
            }
            else if(body.standard=="CORE"){
                Result = await mcswap.coreReceived(params);
            }
            else if(body.standard=="SPL"){
                Result = await mcswap.splReceived(params);
            }
        }
        else{
            if(body.standard=="NFT"){
                Result = await mcswap.nftSent(params);
            }
            else if(body.standard=="PNFT"){
                Result = await mcswap.pnftSent(params);
            }
            else if(body.standard=="CNFT"){
                Result = await mcswap.cnftSent(params);
            }
            else if(body.standard=="CORE"){
                Result = await mcswap.coreSent(params);
            }
            else if(body.standard=="SPL"){
                Result = await mcswap.splSent(params);
            }
        }
        if(typeof Result=="undefined"){Result=[];}
        const stringit = JSON.stringify(Result);
        const response = encodeURIComponent(stringit);
        const transaction = await MemoTx(new PublicKey(req.body.account));
        const payload = {
            transaction,
            message: "searching",
            links:{next:{type:"post",href:host+"/mcswap-result?standard="+body.standard+"&direction="+body.direction+"&response="+response}}
        };
        res.json(payload);
    }
}
catch(err){
    const _err_ = {};
    _err_.status="error";
    _err_.message="finder error";
    _err_.err=err;
    res.status(400).json(_err_);
}
});
mcswap_start.route('/'+name+'-result').post(async(req,res)=>{
    const response = JSON.parse(req.query.response);
    const standard = req.query.standard;
    const direction = req.query.direction;
    const line = "\r\n";
    const obj = {}
    obj.type = "action";
    let selected_nft = false;
    let selected_pnft = false;
    let selected_cnft = false;
    let selected_core = false;
    let selected_spl = false;
    let selected_seller = false;
    let selected_buyer = false;
    if(standard=="NFT"){selected_nft=true;}
    else if(standard=="PNFT"){selected_pnft=true;}
    else if(standard=="CNFT"){selected_cnft=true;}
    else if(standard=="CORE"){selected_core=true;}
    else if(standard=="SPL"){selected_spl=true;}
    if(direction=="sent"){selected_seller=true;}
    else if(direction=="received"){selected_buyer=true;}
    const form = [
        {
            "name": "standard",
            "label": "Program",
            "type": "select",
            "required": true,
            "options": [
                {"label":"NFT","value":"NFT","selected":selected_nft},
                {"label":"PNFT","value":"PNFT","selected":selected_pnft},
                {"label":"CNFT","value":"CNFT","selected":selected_cnft},
                {"label":"CORE","value":"CORE","selected":selected_core}                
            ]
        },
        {
            "name": "direction",
            "label": "Perspective",
            "type": "select",
            "required": true,
            "options": [
                {"label":"Received Contracts","value":"received","selected":selected_buyer},
                {"label":"Sent Contracts","value":"sent","selected":selected_seller}   
            ]
        },
        {
            "name": "wallet",
            "label": "Wallet (optional)",
        }
    ];
    let details = "";
    let items = [];
    if(typeof response.data!="undefined"){items=response.data;}
    let actions = [];
    if(items.length>0){
        items.sort((a, b) => b.utime - a.utime);
        for(let i=0;i<items.length;i++){
            let contract = items[i];
            if(contract.buyerMint.includes("11111111111111111111")){contract.buyerMint="";}
            actions.push({"label":"Open Contract #"+contract.utime,"href":host+"/"+name+"-next?choice=-"+standard.toLowerCase()+"-config/"+contract.sellerMint+"-"+contract.buyerMint});
            let date = new Date(contract.utime*1000);
            let month = date.getMonth();
            let day = date.getDate(); 
            let year = date.getFullYear(); 
            let hours = date.getHours();
            let minutes = date.getMinutes();
            let ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12;
            let formatted=month+"/"+day+"/"+year+" "+hours+":"+minutes+" "+ampm;
            details += "•••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••"+line;
            details += line+"ID: "+contract.utime+line;
            details += line+"CREATED: "+formatted+line;
            details += line+"SELLER"+line;
            details += contract.seller+line;
            if(standard!="SPL"){
                details += line+"ASSET"+line;
                details += contract.sellerMint+line;
            }
            details += line+"BUYER"+line;
            details += contract.buyer+line;
            let blink = contract.seller+"-"+contract.buyer;
            details += line+"BLINK"+line;
            details += "https://mcswap.xyz/spl/"+blink+line;
            details += line+"DIAL"+line;
            details += "https://dial.to/?action=solana-action:"+host+"/"+name+"-config/"+blink+line+line;
        }
        details += "•••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••"+line;
        actions.push({"label":"Contract Finder","href":host+"/"+name+"-next?choice=-finder"});
        actions.push({"label":"Home","href":host+"/"+name+"-next?choice=home"});
        obj.links = {"actions":actions};
    }
    else{
        details += "No Contracts Found"+line;
        details += "•••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••"+line;
        details += "Fetch a list of active sent or received contracts for a wallet."+line;
        obj.links = {"actions":[
            {"label":"Find","href":host+"/"+name+"-find","parameters":form}
        ]};
    }
    obj.type = "action";
    obj.icon = "https://mcswap.xyz/img/mcswap-card.png";
    obj.title = items.length+" "+standard+" Contracts Found";
    obj.description = details;
    obj.label = "Find";
    res.json(obj);
});
export {mcswap_start};