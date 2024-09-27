'use strict';
// *********************************************************************************
import {rpc,host} from '../config.js';
import mcswap from 'mcswap-js';
import Express from 'express';
import { PublicKey } from '@solana/web3.js';
const mcswap_spl = Express.Router();
const name = "mcswap-spl";
const standard = "SPL";
// *********************************************************************************
mcswap_spl.get('/'+name+'-config/*',async(req,res)=>{
    let error = false;
    let details = "";
    const obj = {}
    obj.type = "action";
    const request = (req.originalUrl).split("/");
    const last = request.length-1;  
    const ids = request[last].split("-");
    if(request[last]==""||ids[0]==""||ids[1]==""){error=true;}
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
        params.seller = ids[0];
        params.buyer = ids[1];
        params.standard = standard.toLowerCase();
        const contract = await mcswap.fetch(params);
        if(typeof contract.buyer=="undefined"||typeof contract.seller=="undefined"||typeof contract.token1Mint=="undefined"||typeof contract.token3Mint=="undefined"){
            obj.label = "Invalid Contract";
            obj.links = {"actions":[{"label":"Invalid Contract","href":host+"/"+name+"-invalid"}]};
        }
        else{
            details+="•••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••"+line;
            details+=line+"SELLER"+line;
            details+=contract.seller+line;
            details+=line+standard+" ASSETS"+line;
            details+=contract.token1Symbol+": "+contract.token1Amount+line;
            if(contract.token2Amount>0){details+=contract.token2Symbol+": "+contract.token2Amount+line;}
            details+=line+"•••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••"+line;
            details+=line+"BUYER"+line;
            details+=contract.buyer+line;
            details+=line+standard+" ASSETS"+line;
            details+=contract.token3Symbol+": "+contract.token3Amount+line;
            if(contract.token4Amount>0){details+=contract.token4Symbol+": "+contract.token4Amount+line;}
            details+=line+"•••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••"+line;
            details+=line+"FEE"+line;
            const fee = await mcswap.fee({"rpc":rpc,"standard":"spl"});
            details+=fee+line;
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
mcswap_spl.route('/'+name+'-cancel-build/*').post(async function(req,res){
try{
    if(typeof req.body.account=="undefined"||req.body.account.includes("1111111111111111111111")){res.json(await mcswap.dummy(rpc));}
    else{
        const obj = {};
        const request = (req.originalUrl).split("/");
        const last = request.length - 1;
        const ids = request[last].split("-");
        if(typeof req.body=="undefined"||typeof req.body.account=="undefined"){
            obj.status = "error";
            obj.message = "no account received";
            res.status(400).json(obj);
        }
        else if(ids.length < 2 || ids[0]=="" || ids[1]==""){
            obj.status = "error";
            obj.message = "Invalid Contract";
            res.status(400).json(obj);
        }
        else{
            const params = {"rpc":rpc}
            params.blink = true;
            params.seller = req.body.account;
            params.buyer = ids[1];
            const tx = await mcswap.splCancel(params);
            if(tx.status=="error"){
                if(typeof tx.logs!="undefined"&&tx.logs.includes('Program log: CERROR: Invalid initializer')){
                    tx.message = "only the seller can cancel.. dummy";
                }
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
}
catch(err){
    const _err_ = {};
    _err_.status="error";
    _err_.message="action error";
    _err_.err=err;
    res.status(400).json(_err_);
}
});
mcswap_spl.route('/'+name+'-execute-build/*').post(async function(req,res){
try{
    if(typeof req.body.account=="undefined"||req.body.account.includes("1111111111111111111111")){res.json(await mcswap.dummy(rpc));}
    else{
        const obj = {};
        const request = (req.originalUrl).split("/");
        const last = request.length - 1;
        const ids = request[last].split("-");
        if(request[last]==""||ids[0]==""||ids[1]==""){
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
            params.compute = false;
            params.buyer = req.body.account;
            params.seller = ids[0];
            const tx = await mcswap.splExecute(params);
            if(tx.status=="error"){
                if(typeof tx.logs!="undefined"&&tx.logs.includes('Program log: CERROR: Invalid swap taker')){
                    tx.message = "only the buyer can execute.. dummy";
                }
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
}
catch(err){
    const _err_ = {};
    _err_.status="error";
    _err_.message="action error";
    _err_.err=err;
    res.status(400).json(_err_);
}
});
mcswap_spl.route('/'+name+'-complete').post(async function(req,res){
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
mcswap_spl.get('/'+name+'-create',async(req,res)=>{
    const line = "\r\n";
    let details = "This form creates a sales contract for your asset."+line+"You can't sell SOL, but you can request it as payment.";
    const obj = {}
    obj.type = "action";
    const form = [
        {
            "name": "token1Mint",
            "label": "Sell SPL Mint 1",
            "required": true
        },
        {
            "name": "token1Amount",
            "label": "Sell SPL Amount 1",
            "type": "number",
            "required": true
        },
        {
            "name": "token2Mint",
            "label": "Sell SPL Mint 2 (optional)",
        },
        {
            "name": "token2Amount",
            "label": "Sell SPL Amount 2 (optional)",
            "type": "number"
        },
        {
            "name": "buyer",
            "label": "Buyer Wallet",
            "required": true
        },
        {
            "name": "token3Mint",
            "label": "Request SPL Mint 3",
            "required": true
        },
        {
            "name": "token3Amount",
            "label": "Request SPL Amount 3",
            "type": "number",
            "required": true
        },
        {
            "name": "token4Mint",
            "label": "Request SPL Mint 4 (optional)",
        },
        {
            "name": "token4Amount",
            "label": "Request SPL Amount 4 (optional)",
            "type": "number"
        }
    ];
    obj.label = "Create";
    obj.links = {"actions":[{"label":"Create","href":host+"/"+name+"-create-build","parameters":form}]};
    obj.icon = "https://mcswap.xyz/img/mcswap-card.png";
    obj.title = "Sell a "+standard+" Standard Asset";
    obj.description = details;
    res.json(obj);
});
mcswap_spl.route('/'+name+'-create-build').post(async function(req,res){
try{
    if(typeof req.body.account=="undefined"||req.body.account.includes("1111111111111111111111")){res.json(await mcswap.dummy(rpc));}
    else{
        let error = false;
        const obj = {};
        if(typeof req.body=="undefined"||typeof req.body.account=="undefined"){
            obj.status = "error";
            obj.message = "no account received";
            res.status(400).json(obj);
        }
        else{
            const body = req.body.data;
            if(typeof body.token1Mint!="undefined"){body.token1Mint=body.token1Mint.trim();}else{error=true;}
            if(typeof body.token2Mint!="undefined"){body.token2Mint=body.token2Mint.trim();}
            if(typeof body.token3Mint!="undefined"){body.token3Mint=body.token3Mint.trim();}else{error=true;}
            if(typeof body.token4Mint!="undefined"){body.token4Mint=body.token4Mint.trim();}
            if(typeof body.token1Amount!="undefined"){body.token1Amount=body.token1Amount.trim();}else{error=true;}
            if(typeof body.token2Amount!="undefined"){body.token2Amount=body.token2Amount.trim();}
            if(typeof body.token3Amount!="undefined"){body.token3Amount=body.token3Amount.trim();}else{error=true;}
            if(typeof body.token4Amount!="undefined"){body.token4Amount=body.token4Amount.trim();}
            if(typeof body.buyer!="undefined"){body.buyer=body.buyer.trim();}else{error=true;}
            if(typeof body.token1Mint!="undefined"&&body.token1Mint=="11111111111111111111111111111111"){error=true;}
            if(typeof body.token2Mint!="undefined"&&body.token2Mint=="11111111111111111111111111111111"){error=true;}
            if(typeof body.token4Mint!="undefined"&&body.token4Mint=="11111111111111111111111111111111"){
                const tempMint = body.token3Mint;
                const tempAmount = body.token3Amount;
                body.token3Mint = body.token4Mint;
                body.token3Amount = body.token4Amount;
                body.token4Mint = tempMint;
                body.token4Amount = tempAmount;
            }
            if(error===true){
                obj.status = "error";
                obj.message = "validation error";
                res.status(400).json(obj);
            }
            else{
                const params = {"rpc":rpc}
                params.blink = true;
                params.convert = true;
                params.seller = req.body.account.trim();
                params.buyer = body.buyer.trim();

                params.token1Mint = body.token1Mint;
                if(typeof body.token2Mint!="undefined"){params.token2Mint=body.token2Mint;}
                params.token3Mint = body.token3Mint;
                if(typeof body.token4Mint!="undefined"){params.token4Mint=body.token4Mint;}

                params.token1Amount = body.token1Amount;
                if(typeof body.token2Amount!="undefined"){params.token2Amount=body.token2Amount;}
                params.token3Amount = body.token3Amount;
                if(typeof body.token4Amount!="undefined"){params.token4Amount=body.token4Amount;}

                console.log("params", params);
                const tx = await mcswap.splCreate(params);
                console.log("tx", tx);
                
                if(tx.status!="ok"){
                    res.status(400).json(tx);
                }
                else{
                    tx.links = { 
                        next: { 
                            type: "post", 
                            href: host+"/"+name+"-create-complete?seller="+params.seller+"&buyer="+params.buyer,
                        }
                    }
                    res.json(tx);
                }
            }
        }
    }
}
catch(err){
    const _err_ = {};
    _err_.status="error";
    _err_.message="missing fields";
    _err_.err=err;
    res.status(400).json(_err_);
}
});
mcswap_spl.route('/'+name+'-create-complete').post(async function(req,res){
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
            details += "https://mcswap.xyz/spl/"+req.query.seller+"-"+req.query.buyer+line;
            details += line+"DIAL"+line;
            const dial = req.query.seller+"-"+req.query.buyer;
            details += "https://dial.to/?action=solana-action:"+host+"/"+name+"-config/"+dial+line;
        }
    }
    else{
        end_state = "Confirmed";
        details += line+"BLINK"+line;
        details += "https://mcswap.xyz/spl/"+req.query.sellerMint+"-"+req.query.buyerMint+line;
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
mcswap_spl.route('/'+name+'-invalid').post(async function(req,res){
    res.status(400).json({"message":"invalid contract"});
});
// *********************************************************************************
export {mcswap_spl};