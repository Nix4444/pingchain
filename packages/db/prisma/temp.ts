import {prismaClient} from "../src/index";

async function temp(){

    await prismaClient.websiteTicks.create({
        data:{
            validatorId:"ea4bbd36-11b8-4164-8001-07606c1f6d90",
            websiteId:"1",
            status:"DOWN",
            latency:120,
            timestamp: new Date(Date.now() - 1000 * 60 * 2),
        }
    })
    await prismaClient.websiteTicks.create({
        data:{
            validatorId:"ea4bbd36-11b8-4164-8001-07606c1f6d90",
            websiteId:"1",
            status:"ONLINE",
            latency:120,
            timestamp: new Date(Date.now() - 1000 * 60 * 1),
        }
    })
    await prismaClient.websiteTicks.create({
        data:{
            validatorId:"ea4bbd36-11b8-4164-8001-07606c1f6d90",
            websiteId:"1",
            status:"ONLINE",
            latency:120,
            timestamp: new Date(Date.now() - 1000 * 60 * 1.5),
        }
    })
    await prismaClient.websiteTicks.create({
        data:{
            validatorId:"ea4bbd36-11b8-4164-8001-07606c1f6d90",
            websiteId:"1",
            status:"ONLINE",
            latency:120,
            timestamp: new Date(Date.now() - 1000 * 60 * 1),
        }
    })
    
}

temp()