'use strict';

// *********************************************************************************
// USDC Donation Action
import { rpc, host } from '../config.js';
import { Connection, PublicKey } from "@solana/web3.js";
import * as splToken from "@solana/spl-token";
import mcbuild from '../mcbuild/mcbuild.js';
import Express from 'express';

const donationUsdc = Express.Router();

// *********************************************************************************
// USDC Donation Config
donationUsdc.get('/donate-usdc-config', (req, res) => {
    const config = {
        icon: "https://mcdegen.xyz/images/pfp-416-usdc.png",
        title: "Donate USDC to McDegens DAO",
        description: "Enter USDC amount and click Send",
        label: "donate",
        links: {
            actions: [
                {
                    label: "Send",
                    href: `${host}/donate-usdc-build?amount={amount}`,
                    parameters: [
                        {
                            name: "amount", // input field name
                            label: "USDC Amount", // text input placeholder
                            required: true
                        }
                    ]
                }
            ]
        }
    };
    res.json(config);
});

// *********************************************************************************
// USDC Donation Transaction
donationUsdc.post('/donate-usdc-build', async (req, res) => {
    let error = false;
    let message;

    // Validate inputs
    if (typeof req.body.account === "undefined") {
        error = true;
        message = "User wallet missing";
    } else if (typeof req.query.amount === "undefined" || req.query.amount === "<amount>" || isNaN(req.query.amount)) {
        error = true;
        message = "No amount defined";
    }

    if (error) {
        return res.status(400).json({ message });
    }

    try {
        // Action settings
        const decimals = 6; // USDC has 6 decimals
        const MINT_ADDRESS = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'); // USDC mint address
        const TO_WALLET = new PublicKey('GUFxwDrsLzSQ27xxTVe4y9BARZ6cENWmjzwe8XPy7AKu'); // Treasury wallet

        // Connect: convert value to fractional units
        const SOLANA_CONNECTION = new Connection(rpc, "confirmed");
        const FROM_WALLET = new PublicKey(req.body.account);
        let amount = parseFloat(req.query.amount).toFixed(decimals);
        const TRANSFER_AMOUNT = amount * Math.pow(10, decimals);

        // USDC token account of sender
        const fromTokenAccount = await splToken.getAssociatedTokenAddress(
            MINT_ADDRESS,
            FROM_WALLET,
            false,
            splToken.TOKEN_PROGRAM_ID,
            splToken.ASSOCIATED_TOKEN_PROGRAM_ID
        );

        // Check if the recipient wallet is on curve
        const oncurve = !PublicKey.isOnCurve(TO_WALLET.toString());
        console.log("oncurve:", oncurve);

        // USDC token account of recipient
        const toTokenAccount = await splToken.getAssociatedTokenAddress(
            MINT_ADDRESS,
            TO_WALLET,
            oncurve,
            splToken.TOKEN_PROGRAM_ID,
            splToken.ASSOCIATED_TOKEN_PROGRAM_ID
        ).catch(err => {
            error = true;
            message = "getAssociatedTokenAddress failed!";
            throw new Error(message);
        });

        // Check if the recipient wallet needs a USDC ATA
        let createATA = false;
        await splToken.getAccount(SOLANA_CONNECTION, toTokenAccount, 'confirmed', splToken.TOKEN_PROGRAM_ID)
            .catch(err => {
                if (err.name === "TokenAccountNotFoundError") {
                    createATA = true;
                } else {
                    throw err;
                }
            });

        // Create new instructions array
        const instructions = [];

        // Create and add recipient ATA instructions to array if needed
        if (createATA) {
            const createATAiX = splToken.createAssociatedTokenAccountInstruction(
                FROM_WALLET,
                toTokenAccount,
                TO_WALLET,
                MINT_ADDRESS,
                splToken.TOKEN_PROGRAM_ID,
                splToken.ASSOCIATED_TOKEN_PROGRAM_ID
            );
            instructions.push(createATAiX);
        }

        // Create and add the USDC transfer instructions
        const transferInstruction = splToken.createTransferInstruction(
            fromTokenAccount,
            toTokenAccount,
            FROM_WALLET,
            TRANSFER_AMOUNT
        );
        instructions.push(transferInstruction);

        // Build transaction
        const transactionConfig = {
            rpc,
            account: req.body.account,
            instructions,
            signers: false,
            serialize: true,
            encode: true,
            table: false,
            tolerance: 1.2,
            compute: false,
            fees: false,
            priority: req.query.priority // string: VeryHigh, High, Medium, Low, Min : default Medium
        };

        const tx = await mcbuild.tx(transactionConfig); // Package the transaction
        console.log(tx);
        tx.message = `You sent ${req.query.amount} USDC!`;
        res.json(tx); // Output transaction
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

export { donationUsdc };
// *********************************************************************************