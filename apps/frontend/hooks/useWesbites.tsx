import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import axios from "axios";


interface Website {
    id: string;
    url: string;
    disabled: boolean;
    alias:string;
    ticks: {
        id: string;
        validatorId: string;
        websiteId: string;
        status: "ONLINE" | "DOWN" | "UNKNOWN";
        latency: number;
        timestamp: string;
    }[];
}
export function useWebsites() {
    const { getToken } = useAuth();
    const [websites, setWebsites] = useState<Website[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);


    async function refreshWebsites() {
        try {
            setIsLoading(true);
            setError(null);
            const token = await getToken();
            if (!token) {
                setError(new Error('Unauthorized'));
                return;
              }
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_EXPRESS_BACKEND_URL}/api/websites`,
                {
                    headers: {
                        Authorization: token
                    }
                }
            );
            setWebsites(response.data.websites);
        } catch (error) {
            console.error('Error fetching websites:', error);
            setError(error instanceof Error ? error : new Error('An unknown error occurred'));
        } finally {
            setIsLoading(false);
        }
    }
    useEffect(() => {
        refreshWebsites();
        const interval = setInterval(() => {
            refreshWebsites();
        }, 1000 * 60 * 1)
        return () => clearInterval(interval);
    }, [])


    return { websites, isLoading, error, refreshWebsites }


}