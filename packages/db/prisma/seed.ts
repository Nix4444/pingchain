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
            status:"HEALTHY",
            timestamp: new Date(),
            latency:100,
            validatorId:validator.id

        }
    })
    await prismaClient.websiteTicks.create({
        data:{
            websiteId:"1",
            status:"UNHEALTHY",
            timestamp: new Date(Date.now() - 1000 * 60 * 10),
            latency:100,
            validatorId:validator.id

        }
    })
    await prismaClient.websiteTicks.create({
        data:{
            websiteId:"1",
            status:"HEALTHY",
            timestamp: new Date(Date.now() - 1000 * 60 * 20),
            latency:100,
            validatorId:validator.id

        }
    })

    await prismaClient.website.create({
        data:{
            id:"2",
            url:"https://test2.com",
            userId:"1"
        }
    })
    await prismaClient.websiteTicks.create({
        data:{
            websiteId:"2",
            status:"UNHEALTHY",
            timestamp: new Date(),
            latency:100,
            validatorId:validator.id
        }
    })

}
seed()