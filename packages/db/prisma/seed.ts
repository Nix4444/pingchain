import {prismaClient} from "../src/index"
async function seed(){
    await prismaClient.user.create({
        data:{
            id:"1",
            email:"example@example.com",
            password:"test"
        }
    }),
    await prismaClient.website.create({
        data:{
            id:"1",
            url:"https://test.com",
            alias:"Test Website",
            userId:"1"
        }
    })
    const validator = await prismaClient.validator.create({
        data:{
            publicKey:"abcacas",
            location:"Delhi",
            ip:"127.0.0.1"
        }
    })

    await prismaClient.websiteTicks.create({
        data:{
            websiteId:"1",
            status:"ONLINE",
            timestamp: new Date(),
            latency:100,
            validatorId:validator.id

        }
    })
    await prismaClient.websiteTicks.create({
        data:{
            websiteId:"1",
            status:"DOWN",
            timestamp: new Date(Date.now() - 1000 * 60 * 10),
            latency:100,
            validatorId:validator.id

        }
    })
    await prismaClient.websiteTicks.create({
        data:{
            websiteId:"1",
            status:"ONLINE",
            timestamp: new Date(Date.now() - 1000 * 60 * 20),
            latency:100,
            validatorId:validator.id

        }
    })

    await prismaClient.website.create({
        data:{
            id:"2",
            url:"https://test2.com",
            alias:"Test 2",
            userId:"1"
        }
    })
    await prismaClient.websiteTicks.create({
        data:{
            websiteId:"2",
            status:"DOWN",
            timestamp: new Date(),
            latency:100,
            validatorId:validator.id
        }
    })

}
seed()