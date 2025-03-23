  "use client";

  import { useWebsites } from "@/hooks/useWesbites";
  import { 
    Card, 
    CardContent, 
    CardDescription, 
    CardHeader, 
    CardTitle 
  } from "@/components/card";
  import { useMemo, useState,useEffect } from "react";
  import { useAuth } from "@clerk/nextjs";
  import { UptimeStatus } from "@repo/types";
  import { WebsiteModal } from "@/components/AddWebsiteModal";
  import { Button } from "@/components/ui/button";
  import { DeleteIcon } from "@/components/icons/DeleteIcon";
  import { useRouter } from "next/navigation";
  function UptimeTicks({ ticks }: { ticks: UptimeStatus[] }) {
    return (
      <div className="flex gap-1">
        {ticks.map((tick, index) => (
          <div
            key={index}
            className={`w-4 h-10 rounded ${
              tick === "ONLINE"
                ? "bg-green-500"
                : tick === "DOWN"
                ? "bg-red-500"
                : "bg-gray-500"
            }`}
          />
        ))}
      </div>
    );
  }

  function getStatusColor(status: UptimeStatus) {
    switch (status) {
      case "ONLINE":
        return "text-green-500";
      case "DOWN":
        return "text-red-500";
      case "UNKNOWN":
      default:
        return "text-gray-500";
    }
  }


  export default function Dashboard() {
    const { websites, isLoading, error, refreshWebsites } = useWebsites();
    const { getToken } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter()

    useEffect(() => {
      const checkToken = async () => {
        const token = await getToken();
        if (!token) {
          router.push("/");
        }
      };
      checkToken();
    },);
    const processedWebsites = useMemo(() => {
      const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);
      return websites.map((website) => {
        const sortedTicks = [...website.ticks].sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        const recentTicks = sortedTicks.filter(
          (tick) => new Date(tick.timestamp) >= thirtyMinAgo
        );
        const windows: UptimeStatus[] = [];

        for(let i = 0; i<10;i++){
          const windowStart = new Date(Date.now() - (i+1)*3*60*1000);
          const windowEnd = new Date(Date.now()-i*3*60*1000);

          const windowTicks = recentTicks.filter(tick=>{
            const tickTime = new Date(tick.timestamp);
            return tickTime >= windowStart && tickTime < windowEnd
          })
          const upTicks = windowTicks.filter(tick=>tick.status === "ONLINE").length;
          windows[9-i] = windowTicks.length === 0 ? "UNKNOWN" : (upTicks/windowTicks.length) >= 0.5 ? "ONLINE" : "DOWN";

        }
        const totalTicks = sortedTicks.length;
        const upTicks = sortedTicks.filter(tick=>tick.status === "ONLINE").length;
        const uptimePercentage = totalTicks === 0 ? 100 : Number(((upTicks/totalTicks) * 100).toFixed(2));
        const currentStatus = windows[windows.length - 1];
        const lastChecked = sortedTicks[0]
          ? new Date(sortedTicks[0].timestamp).toLocaleTimeString()
          : 'Never';


        return {
          ...website,
          status:currentStatus,
          uptimePercentage: uptimePercentage,
          lastChecked: lastChecked,
          uptimeTicks:windows
        };
      });
    }, [websites]);

    if (isLoading) {
      return (
        <div className="flex h-screen items-center justify-center">
          <p>Loading websites...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex h-screen items-center justify-center">
          <p className="text-red-500">Error loading websites: {error.message}</p>
        </div>
      );
    }

    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Website Monitoring Dashboard</h1>
          <Button variant={"secondary"}
            onClick={() => setIsModalOpen(true)}
            className="cursor-pointer"
          >
            Add Website
          </Button>
        </div>
        
        {processedWebsites.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600 mb-4">No websites found.</p>
            <p className="text-sm text-gray-500">Add a website using the button above to start monitoring.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {processedWebsites.map((website) => {
              return (
                <Card key={website.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{website.alias} | {website.url}</span>
                      <div className="flex items-center gap-6">
                        <span className={getStatusColor(website.status)}>
                          <span className="text-xl mr-1">•</span> {website.status}
                        </span>
                        <span 
                          key={website.id} 
                          className="text-red-500 cursor-pointer"
                          onClick={async () => {
                            try {
                              const token = await getToken();
                              if(!token){
                                router.push("/");
                                return;
                              }
                              const response = await fetch(`${process.env.NEXT_PUBLIC_EXPRESS_BACKEND_URL}/api/website/${website.id}`, {
                                method: 'DELETE',
                                headers:{
                                  Authorization:token as string
                                }
                              });
                              if (!response.ok) {
                                throw new Error('Failed to delete website');
                              }
                              refreshWebsites();
                            } catch (err) {
                              console.error('Error deleting website:', err);
                            }
                          }}
                        >
                          <DeleteIcon />
                        </span>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      Validators Online: XXXXX
                    </CardDescription>
                    <CardDescription>
                      {website.uptimePercentage}% Uptime
                    </CardDescription>
                  </CardHeader>
                  <span className="ml-6 text-sm underline">
                  Last 30 minutes status:
                  </span>
                          
                  <CardContent>
                    <UptimeTicks ticks={website.uptimeTicks} />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsModalOpen(false)}>
            <div onClick={(e) => e.stopPropagation()}>
              <WebsiteModal 
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                  setIsModalOpen(false);
                  refreshWebsites();
                }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }
