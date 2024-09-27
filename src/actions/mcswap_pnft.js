'use strict';
// *********************************************************************************
import {rpc,host} from '../config.js';
import mcswap from 'mcswap-js';
import Express from 'express';
import { PublicKey } from '@solana/web3.js';
const mcswap_pnft = Express.Router();
const name = "mcswap-pnft";
const standard = "PNFT";
// *********************************************************************************
mcswap_pnft.get('/'+name+'-config/*',async(req,res)=>{
    let error = false;
    let details = "";
    const obj = {}
    obj.type = "action";
    const request = (req.originalUrl).split("/");
    const last = request.length-1;  
    const ids = request[last].split("-");
    if(request[last]==""||ids[0]==""){error=true;}
    if(error===true){
        obj.type = "completed";
        obj.icon = "https://mcswap.xyz/img/mcswap-card.png";
        obj.title = "McSwap Error";
        obj.description = "Invalid Request";
        res.json(obj);
    }
    else{
        const line = "\r\n";
        const params = {"rpc":rpc}
        params.display = true;
        params.sellerMint = ids[0];
        params.buyerMint = ids[1];
        params.standard = standard.toLowerCase();
        const contract = await mcswap.fetch(params);
        if(typeof contract.buyer=="undefined"||typeof contract.seller=="undefined"||typeof contract.buyerMint=="undefined"){
            obj.label = "Invalid Contract";
            obj.links = {"actions":[{"label":"Invalid Contract","href":host+"/"+name+"-invalid"}]};
        }
        else{
            details+="•••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••"+line;
            details+=line+"SELLER"+line;
            details+=contract.seller+line;
            details+=line+standard+" ASSET"+line;
            details+=contract.sellerMint+line+line;
            details+="•••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••"+line;
            details+=line+"BUYER"+line;
            details+=contract.buyer+line;
            if(contract.buyerMint!="11111111111111111111111111111111"){
                details+=line+standard+" ASSET"+line;
                details+=contract.buyerMint+line;
            }
            if(contract.lamports>0||contract.units>0){details+=line+"TOKENS"+line;}
            if(contract.lamports>0){details+=contract.lamports+" SOL"+line;}
            if(contract.units>0){details+=contract.units+" "+contract.symbol+line;}
            obj.label = "setup";
            obj.links = {"actions":[
                {"label":"Cancel Contract","href":host+"/"+name+"-cancel-build/"+request[last]},
                {"label":"Execute Contract","href":host+"/"+name+"-execute-build/"+request[last]}
            ]};
        }
        obj.icon = "https://mcswap.xyz/img/mcswap-card.png";
        obj.title = "McSwap "+standard+" Contract";
        obj.description = details;
        res.json(obj);
    }
});
mcswap_pnft.route('/'+name+'-cancel-build/*').post(async function(req,res){
try{
    const obj = {};
    const request = (req.originalUrl).split("/");
    const last = request.length - 1;
    const ids = request[last].split("-");
    if(typeof req.body=="undefined"||typeof req.body.account=="undefined"){
        obj.status = "error";
        obj.message = "no account received";
        res.status(400).json(obj);
    }
    else if(ids.length<2||ids[0]==""){
        obj.status = "error";
        obj.message = "Invalid Contract";
        res.status(400).json(obj);
    }
    else{
        const params = {"rpc":rpc}
        params.blink = true;
        params.seller = req.body.account;
        params.sellerMint = ids[0];
        params.buyerMint = ids[1];
        const tx = await mcswap.pnftCancel(params);
        if(tx.status=="error"){
            if(typeof tx.logs!="undefined"&&tx.logs.includes('Program log: CERROR: Invalid initializer')){
                tx.message = "only the seller can cancel.. dummy";
            }
            console.log(tx);
            res.status(400).json(tx);
        }
        else{
            tx.links = { 
                next: { 
                    type: "post", 
                    href: host+"/"+name+"-complete?ref=Cancel",
                }
            }
            res.json(tx);
        }
    }
}
catch(err){
    const _err_ = {};
    _err_.status="error";
    _err_.message="action error";
    _err_.err=err;
    res.status(400).json(_err_);
}
});
mcswap_pnft.route('/'+name+'-execute-build/*').post(async function(req,res){
try{
    const obj = {};
    const request = (req.originalUrl).split("/");
    const last = request.length - 1;
    const ids = request[last].split("-");
    if(request[last]==""||ids[0]==""){
        obj.status = "error";
        obj.message = "invalid request";
        res.status(400).json(obj);
    }
    else if(typeof req.body=="undefined"||typeof req.body.account=="undefined"){
        obj.status = "error";
        obj.message = "missing account";
        res.status(400).json(obj);
    }
    else{
        const params = {"rpc":rpc}
        params.blink = true;
        params.buyer = req.body.account;
        params.sellerMint = ids[0];
        params.buyerMint = ids[1];
        const tx = await mcswap.pnftExecute(params);
        if(tx.status=="error"){
            if(typeof tx.logs!="undefined"&&tx.logs.includes('Program log: Incorrect account owner')){
                tx.message = "only the buyer can execute.. dummy";
            }
            console.log(tx);
            res.status(400).json(tx);
        }
        else{
            tx.links = { 
                next: { 
                    type: "post", 
                    href: host+"/"+name+"-complete?ref=Trade",
                }
            }
            res.json(tx);
        }
    }
}
catch(err){
    const _err_ = {};
    _err_.status="error";
    _err_.message="action error";
    _err_.err=err;
    console.log(_err_);
    res.status(400).json(_err_);
}
});
mcswap_pnft.route('/'+name+'-complete').post(async function(req,res){
    const obj = {}
    const line = "\r\n";
    let details = "";
    let end_state = "Confirmed";
    if(typeof req.body.signature!="undefined"){
        details+="•••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••"+line;
        details += line+"SIGNATURE"+line;
        details += req.body.signature+line;
        const status = await mcswap.status(rpc,req.body.signature,12,2);
        if(status!="finalized"){
            end_state = "Error";
            details += "We encountered an error"+line;
        }
        else{
            end_state = "Complete";
        }
    }
    else{
        end_state = "Confirmed";
    }
    obj.type = "completed";
    obj.icon = "https://mcswap.xyz/img/mcswap-card.png";
    obj.title = req.query.ref+" "+end_state;
    obj.description = details;
    obj.label = "Complete";
    res.json(obj);
});
// *********************************************************************************
mcswap_pnft.get('/'+name+'-create',async(req,res)=>{
    const line = "\r\n";
    let details = "This form creates a sales contract for your asset."+line+"Minimum one of the (optional) fields is required.";
    const obj = {}
    obj.type = "action";
    const form = [
        {
            "name": "sellerMint",
            "label": "Seller "+standard+" Asset Address",
            "required": true
        },
        {
            "name": "buyer",
            "label": "Buyer Wallet",
            "required": true
        },
        {
            "name": "buyerMint",
            "label": "Buyer "+standard+" Asset Address (optional)",
            "required": false
        },
        {
            "name": "lamports",
            "label": "Request SOL Amount (optional)",
            "type": "number",
            "required": false
        },
        {
            "name": "tokenMint",
            "label": "Request Token Mint (optional)",
            "required": false
        },
        {
            "name": "units",
            "label": "Request Token Amount (optional)",
            "type": "number",
            "required": false
        }
    ];
    obj.label = "Create";
    obj.links = {"actions":[{"label":"Create","href":host+"/"+name+"-create-build","parameters":form}]};
    obj.icon = "https://mcswap.xyz/img/mcswap-card.png";
    obj.title = "Sell a "+standard+" Standard Asset";
    obj.description = details;
    res.json(obj);
});
mcswap_pnft.route('/'+name+'-create-build').post(async function(req,res){
try{
    let error = false;
    const obj = {};
    if(typeof req.body=="undefined"||typeof req.body.account=="undefined"){
        obj.status = "error";
        obj.message = "no account received";
        res.status(400).json(obj);
    }
    else{
        const body = req.body.data;
        if(typeof body.sellerMint!="undefined"){body.sellerMint=body.sellerMint.trim();}else{error=true;}
        if(typeof body.buyer!="undefined"){body.buyer=body.buyer.trim();}else{error=true;}
        if(typeof body.buyerMint=="undefined"&&typeof body.lamports=="undefined"&&typeof body.tokenMint=="undefined"&&typeof body.units=="undefined"||
        typeof body.tokenMint=="undefined"&&typeof body.units!="undefined"||
        typeof body.tokenMint!="undefined"&&typeof body.units=="undefined"){error=true;}
        if(error===true){
            obj.status = "error";
            obj.message = "missing required fields";
            res.status(400).json(obj);
        }
        else{
            const params = {"rpc":rpc}
            params.blink = true;
            params.convert = true;
            params.seller = req.body.account.trim();
            params.sellerMint = body.sellerMint.trim();
            params.buyer = body.buyer.trim();
            const check_seller = new PublicKey(params.seller);
            const check_sellerMint = new PublicKey(params.sellerMint);
            const check_buyer = new PublicKey(params.buyer);
            if(typeof body.buyerMint!="undefined"){params.buyerMint=body.buyerMint.trim();
                const check_buyerMint = new PublicKey(params.buyerMint);
            }
            if(typeof body.lamports!="undefined"){params.lamports=body.lamports.trim();}
            if(typeof body.tokenMint!="undefined"){
                params.tokenMint=body.tokenMint.trim();
                const check_tokenMint = new PublicKey(params.tokenMint);
            }
            if(typeof body.units!="undefined"){params.units=body.units.trim();}
            let tx;
            if(standard=="NFT"){
                tx = await mcswap.nftCreate(params);
            }
            else if(standard=="CNFT"){
                tx = await mcswap.cnftCreate(params);
            }
            else if(standard=="PNFT"){
                tx = await mcswap.pnftCreate(params);
                console.log(tx);
            }
            else if(standard=="CORE"){
                tx = await mcswap.coreCreate(params);
            }
            if(tx.status!="ok"){
                res.status(400).json(tx);
            }
            else{
                if(typeof params.buyerMint=="undefined"){params.buyerMint="";}
                tx.links = { 
                    next: { 
                        type: "post", 
                        href: host+"/"+name+"-create-complete?sellerMint="+params.sellerMint+"&buyerMint="+params.buyerMint,
                    }
                }
                res.json(tx);
            }
        }
    }
}
catch(err){
    const _err_ = {};
    _err_.status="error";
    _err_.message="error preparing transaction";
    _err_.err=err;
    res.status(400).json(_err_);
}
});
mcswap_pnft.route('/'+name+'-create-complete').post(async function(req,res){
    const obj = {}
    const line = "\r\n";
    let details = "";
    let end_state = "Confirmed";
    if(typeof req.body.signature!="undefined"){
        details+="•••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••"+line;
        details += line+"SIGNATURE"+line;
        details += req.body.signature+line;
        const status = await mcswap.status(rpc,req.body.signature,12,2);
        if(status!="finalized"){
            end_state = "Error";
            details += "We encountered an error"+line;
        }
        else{
            end_state = "Contract Created";
            details += line+"BLINK"+line;
            details += "https://mcswap.xyz/swap/"+req.query.sellerMint+"-"+req.query.buyerMint+line;
            details += line+"DIAL"+line;
            const dial = req.query.sellerMint+"-"+req.query.buyerMint;
            details += "https://dial.to/?action=solana-action:"+host+"/"+name+"-config/"+dial+line;
        }
    }
    else{
        end_state = "Confirmed";
        details += line+"BLINK"+line;
        details += "https://mcswap.xyz/swap/"+req.query.sellerMint+"-"+req.query.buyerMint+line;
        details += line+"DIAL"+line;
        const dial = req.query.sellerMint+"-"+req.query.buyerMint;
        details += "https://dial.to/?action=solana-action:"+host+"/"+name+"-config/"+dial+line;
    }
    obj.type = "completed";
    obj.icon = "https://mcswap.xyz/img/mcswap-card.png";
    obj.title = end_state;
    obj.description = details;
    obj.label = end_state;
    res.json(obj);
});
// *********************************************************************************
mcswap_pnft.route('/'+name+'-invalid').post(async function(req,res){
    res.status(400).json({"message":"invalid contract"});
});
// *********************************************************************************
export {mcswap_pnft};