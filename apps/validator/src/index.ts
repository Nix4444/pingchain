import {v4 as uuidv4} from "uuid"
import type {OutgoingMessage,IncomingMessage,SignupIncomingMessage, SignupOutgoingMessage, ValidateOutgoingMessage} from "@repo/types";
import { Keypair } from "@solana/web3.js";
import nacl from "tweetnacl";
import naclUtil  from "tweetnacl-util";
import dotnev from "dotenv"
dotnev.config()

const CALLBACKS:{[callbackId:string]: (data:SignupOutgoingMessage)=>void} = {}

//let validatorId: string | null = null;

async function signMessage(message: string, keypair: Keypair) {
    const messageBytes = naclUtil.decodeUTF8(message);
    const signature = nacl.sign.detached(messageBytes, keypair.secretKey);

    return JSON.stringify(Array.from(signature));
}
async function main(){
    const keypair = Keypair.fromSecretKey(
        Uint8Array.from("asndjshdjshdsdsds") //sign it using the wallet provider
    )
    const ws = new WebSocket(`${process.env.WS_URL}`);

    ws.onmessage = async (event) =>{
        const data:OutgoingMessage = JSON.parse(event.data);
        if (data.type === 'signup'){
            CALLBACKS[data.data.callbackId]?.(data.data)
            delete CALLBACKS[data.data.callbackId]
        }else if(data.type === 'validate'){
            await validateHandler(ws,data.data,keypair);
        }


    }
    ws.onopen = async () => {
        const callbackId = uuidv4();
        CALLBACKS[callbackId] = (data:SignupOutgoingMessage) => {
            //connect this to frontend and store the validatorid somewhere on browser
            return;
        }
        const signedMessage = await signMessage(`Signed message for ${callbackId} ${keypair.publicKey}`,keypair);
        ws.send(JSON.stringify({
            type: 'signup',
            data: {
                callbackId,
                ip:'127.0.0.1', //TODO: get ip address
                publicKey:keypair.publicKey,
                signedMessage
            }
        }))
    }}
async function validateHandler(ws:WebSocket,data:ValidateOutgoingMessage,keypair:Keypair){
    const startTime = Date.now();
    const signature = await signMessage(`Replying to ${data.callbackId}`,keypair);
    try{
        const response = await fetch(data.url);
        const endTime = Date.now()
        const latency = endTime - startTime;
        const status = response.status;
        ws.send(JSON.stringify({
            type: "validate",
            data: {
                callbackId: data.callbackId,
                latency,
                status: status == 200 ? "ONLINE" : "DOWN",
                validatorId: data.validatorId,
                websiteId: data.websiteId,
                signedMessage: signature
            }
        }));
    }catch(e){
        ws.send(JSON.stringify({
            type: "validate",
            data: {
                callbackId: data.callbackId,
                latency: 999,
                status: "DOWN",
                validatorId: data.validatorId,
                websiteId: data.websiteId,
                signedMessage: signature
            }
        }))
    }
}
main();

setInterval(async () => {

}, 10000);
