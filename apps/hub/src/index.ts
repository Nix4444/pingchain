import dotenv from "dotenv";
import { WebSocketServer, WebSocket } from "ws";
import { v4 as uuidv4 } from "uuid";
import type { IncomingMessage, OutgoingMessage, SignupIncomingMessage, ValidateIncomingMessage, ValidateOutgoingMessage } from "@repo/types";
import { prismaClient } from "@repo/db";
import { PublicKey } from "@solana/web3.js";
import nacl from "tweetnacl";
import naclUtil from "tweetnacl-util";

dotenv.config();

const availableValidators: { validatorId: string, socket: WebSocket, publicKey: string }[] = [];
const CALLBACKS: { [callbackId: string]: (data: ValidateIncomingMessage) => void } = {};
const payoutPerValidation = 100 //lamports

const wss = new WebSocketServer({
    port: Number(process.env.WS_PORT)
});

async function verifyMessage(message: string, publicKey: string, signature: string) {
    const messageBytes = naclUtil.decodeUTF8(message);
    const result = nacl.sign.detached.verify(
        messageBytes,
        new Uint8Array(JSON.parse(signature)),
        new PublicKey(publicKey).toBytes(),
    );

    return result;
}
wss.on("connection", (socket) => {
    socket.on("message", async (message) => {
        try {
            const data: IncomingMessage = JSON.parse(message.toString())
            if (data.type === 'signup') {
                const verified = await verifyMessage(
                    `Signed message for ${data.data.callbackId} ${data.data.publicKey}`,
                    data.data.publicKey,
                    data.data.signedMessage
                )
                if (verified) {
                    await signupHandler(socket, data.data)

                }

            }
            else if (data.type === 'validate') {
                const callback = CALLBACKS[data.data.callbackId]
                if (callback) {
                    callback(data.data)
                    delete CALLBACKS[data.data.callbackId];
                }
            }

        } catch (e) {
            //INVLAID JSON MESSAGE RECEIVED
        }

    })
    socket.on("close", () => {
        const index = availableValidators.findIndex(v => v.socket === socket);
        if (index !== -1) {
            availableValidators.splice(index, 1);
        }
    })
})
async function signupHandler(socket: WebSocket, { ip, publicKey, signedMessage, callbackId }: SignupIncomingMessage) {
    const validatorDb = await prismaClient.validator.findFirst({
        where: {
            publicKey: publicKey
        }
    })
    if (validatorDb) {
        socket.send(JSON.stringify({
            type: 'signup',
            data: {
                validatorId: validatorDb.id,
                callbackId
            }
        }))
        availableValidators.push({
            validatorId: validatorDb.id,
            socket: socket,
            publicKey: publicKey
        })
        return;
    } else {
        try {
            const location = await fetch(`https://ipapi.co/${ip}/json/`)
                .then(res => res.json())
                .then(data => `${data.city}, ${data.country_name}`)
                .catch(() => "unknown");
            const validator = await prismaClient.validator.create({
                data: {
                    ip,
                    location: location,
                    publicKey: publicKey
                }
            })
            if (validator) {
                socket.send(JSON.stringify({
                    type: 'signup', 
                    data: {
                        validatorId: validator.id,
                        callbackId: callbackId
                    }
                }))

                availableValidators.push({
                    validatorId: validator.id,
                    socket: socket,
                    publicKey: publicKey
                })
                return

            }

        } catch (e) {
            console.log(e);
            return;
        }


    }


}


setInterval(async () => {
    const websiteMonitor = await prismaClient.website.findMany({
        where: {
            disabled: false
        }
    })
    for (const website of websiteMonitor) {
        availableValidators.forEach(validator => {
            const callbackId = uuidv4();
            validator.socket.send(JSON.stringify({
                type: 'validate',
                data: {
                    callbackId: callbackId,
                    websiteId: website.id,
                    url: website.url,
                    validatorId: validator.validatorId
                } as ValidateOutgoingMessage
            }))
            CALLBACKS[callbackId] = async (data: ValidateIncomingMessage)=>{
                const { validatorId, websiteId, callbackId, signedMessage, status, latency } = data
                const verified = verifyMessage(
                    `Replying to ${callbackId}`,
                    validator.publicKey,
                    signedMessage
                )
                if(!verified){
                    return;
                }
                await prismaClient.$transaction(async (tx)=>{
                    await tx.websiteTicks.create({
                        data:{
                            websiteId:websiteId,
                            validatorId:validatorId,
                            latency:latency,
                            status:status,
                            timestamp: new Date()
                        },
                    
                    })
                    await tx.validator.update({
                        where:{
                            id:validatorId,
                        },
                        data:{
                            pendingPayouts: {increment: payoutPerValidation}
                        }
                    })
                })
                
            }
        })
    }
},60*1000)