import {prismaClient} from "../src/index";

async function temp(){
    await prismaClient.websiteTicks.create({
        data:{
            websiteId:"772c89f7-6827-422d-b889-19c0d8e5f19b",
            status:"DOWN",
            timestamp: new Date(),
            latency:100,
            validatorId:"4d04d789-ef58-407a-b401-b5541484cfc8"

        }
    })
}
temp()