import express from "express"
import dotenv from "dotenv"
import { authMiddleware } from "./middleware"
import { prismaClient } from "@repo/db"
import cors from "cors";
import axios from "axios";
dotenv.config()
const PORT = process.env.PORT || 8080
const app = express();
app.set('trust proxy', true);
app.use(cors())
app.use(express.json())


//add zod
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "Server is running"
    })
})

app.post("/api/proxy", async (req, res) => {
    const { url } = req.body;
    
    if (!url) {
        res.status(400).json({
            success: false,
            message: "URL is required"
        });
        return;
    }

    try {
        const response = await axios.get(url, {
            validateStatus: () => true, 
            timeout: 20000 
        });
    
        if (response.status >= 200 && response.status < 300) {
            res.status(200).json({
                success: true,
                status: response.status,
                statusText: response.statusText
            });
        } else {
            res.status(response.status).json({
                success: false,
                status: response.status,
                statusText: response.statusText
            });
        }
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Failed to complete the request",
            error: error.message
        });
    }
});

app.post("/api/website", authMiddleware, async (req,res) => {
    const userId = req.userId!
    const { url,alias } = req.body
    try {
        const data = await prismaClient.website.create({
            data: {
                userId: userId,
                url: url,
                alias: alias
            }
        })
        res.json({
            id: data.id,
            success: true
        })

    } catch (e) {
        res.status(500).json({
            success: false,
            message: "Failed to create website"
        })
    }


})

app.get("/api/website/status/:websiteId", authMiddleware, async (req, res) => {
    const websiteId = req.params.websiteId;
    const userId = req.userId!
    try {
        const data = await prismaClient.website.findFirst({
            where: {
                id: websiteId,
                userId: userId,
                disabled:false
            },
            include: {
                ticks: true
            }
        })

        res.json({
            data,
            success: true
        })

    } catch (e) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch the website status"
        })
    }

})

app.get("/api/websites", authMiddleware, async (req, res) => {
    const userId = req.userId;
    try {
        const websites = await prismaClient.website.findMany({
            where: {
                userId: userId,
                disabled: false
            },
            include: {
                ticks: true
            }
        })
        res.json({
            success: true,
            websites
        })

    } catch (e) {
        console.log(e)
        res.status(500).json({
            success: false,
            message: "Failed to get websites"
        });
    }


})

app.delete("/api/website/:websiteId", authMiddleware, async (req, res) => {
    const userId = req.userId;
    const websiteId = req.params.websiteId;

    try {
        const updatedWebsite = await prismaClient.website.update({
            where: {
                userId: userId,
                id: websiteId
            },
            data: {
                disabled: true
            }
        });

        res.json({
            success: true,
            message: "Website disabled successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to disable website"
        });
    }
})

app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });