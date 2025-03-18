"use client";

import { useWebsites } from "@/hooks/useWesbites";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { useMemo } from "react";
import { useAuth } from "@clerk/nextjs";
import { UptimeStatus } from "@repo/types";

// Reusable component to show a row of colored tick bars
function UptimeTicks({ ticks }: { ticks: UptimeStatus[] }) {
  return (
    <div className="flex gap-1 mt-2">
      {ticks.map((tick, index) => (
        <div
          key={index}
          className={`w-8 h-2 rounded ${
            tick === "HEALTHY"
              ? "bg-green-500"
              : tick === "UNHEALTHY"
              ? "bg-red-500"
              : "bg-gray-500"
          }`}
        />
      ))}
    </div>
  );
}

// Helper to get status color for text
function getStatusColor(status: "HEALTHY" | "UNHEALTHY" | "UNKNOWN") {
  switch (status) {
    case "HEALTHY":
      return "text-green-500";
    case "UNHEALTHY":
      return "text-red-500";
    case "UNKNOWN":
    default:
      return "text-gray-500";
  }
}

// Helper to format date
function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleTimeString();
}

export default function Dashboard() {
  const { websites, isLoading, error } = useWebsites();
  const { getToken } = useAuth();
  
  // 30 minutes ago
  const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);

  // Sort & filter ticks once so we don’t do it repeatedly in the JSX
  const processedWebsites = useMemo(() => {
    return websites.map((website) => {
      // Sort ascending by timestamp (oldest first)
      const sortedTicks = [...website.ticks].sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      // Filter for only the last 30 minutes
      const recentTicks = sortedTicks.filter(
        (tick) => new Date(tick.timestamp) >= thirtyMinAgo
      );

      return {
        ...website,
        sortedTicks,
        recentTicks,
      };
    });
  }, [websites, thirtyMinAgo]);

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
      <h1 className="text-3xl font-bold mb-6">Website Monitoring Dashboard</h1>
      
      {processedWebsites.length === 0 ? (
        <p>No websites found. Add a website to start monitoring.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {processedWebsites.map((website) => {
            // The *latest* tick is the last item in sortedTicks (because it’s oldest → newest)
            const latestTick = website.sortedTicks[website.sortedTicks.length - 1];
            const currentStatus = latestTick?.status || "UNKNOWN";

            return (
              <Card key={website.id} className={website.disabled ? "opacity-60" : ""}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{website.url}</span>
                    <span className={getStatusColor(currentStatus)}>
                      {currentStatus}
                    </span>
                  </CardTitle>
                  <CardDescription>
                    {website.disabled ? "Monitoring disabled" : "Monitoring active"}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  {/* Mini colored bar history for the last 30 minutes */}
                  <UptimeTicks ticks={website.recentTicks.map(t => t.status)} />

                  {/* Expandable detailed history */}
                  <Accordion type="single" collapsible>
                    <AccordionItem value="ticks">
                      <AccordionTrigger>
                        View monitoring data (last 30 min)
                      </AccordionTrigger>
                      
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
