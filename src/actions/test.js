import {rpc,host} from '../config.js';
import Express from 'express';
import { MEMO_PROGRAM_ID } from "@solana/actions";
import { Connection, PublicKey, Keypair, Transaction, ComputeBudgetProgram, TransactionInstruction } from '@solana/web3.js';

const test = Express.Router();
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

// html
test.get('/blink-one', (req, res) => {
    
    // sharing on X would be api.com/blink-one

    // output html including og tags for social card

});

test.get('/api/actions/blink-one', (req, res) => {
    try {
        const jsonData = {
            type: "action",
            icon: 'https://pbs.twimg.com/media/GTDGt3wbAAAmYQ5?format=jpg&name=large',
            title: 'Hello World',
            description: "This is my first blink",
            label: "Blink",
            links: {
                actions: [{
                    label: "click",
                    href: host + "/api/actions/send"
                }],
            },
            disabled: false,
            error: { message: "This blink is not implemented yet!" }
        };
        res.json(jsonData);
    } catch (error) {
        console.error(error);
        res.status(400).json({message:error});
    }
});

test.post('/api/actions/send-one', async (req, res) => {
    const wallet = Keypair.generate();
    const pubkey = wallet.publicKey;
    const tx = await MemoTx(pubkey);
    const payload = {transaction:tx,message:'hello'}
    console.log(payload);
    res.json(payload);
});

export {test};