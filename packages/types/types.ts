export type UptimeStatus = "ONLINE" | "DOWN" | "UNKNOWN";

export interface SignupIncomingMessage{
    ip:string,
    publicKey:string,
    signedMessage:string,
    callbackId:string

}
export interface SignupOutgoingMessage{
    validatorId:string,
    callbackId:string
}

export interface ValidateIncomingMessage{
    callbackId:string,
    signedMessage:string,
    validatorId:string,
    websiteId:string,
    status: "ONLINE" | "DOWN",
    latency:number
}
export interface ValidateOutgoingMessage{
    callbackId:string,
    websiteId:string,
    url:string  
}

export type IncomingMessage = {
    type: 'signup',
    data:SignupIncomingMessage
} | {
    type: 'validate',
    data: ValidateIncomingMessage
}

export type OutgoingMessage = {
    type: 'signup',
    data: SignupOutgoingMessage
} | {
    type: 'validate',
    data:ValidateOutgoingMessage
}