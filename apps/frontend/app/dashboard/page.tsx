"use client";

import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

// Mock data - in a real app, this would come from your API
const websites = [
  {
    id: 1,
    name: "example.com",
    url: "https://example.com",
    status: "up", // up or down
    uptime: "99.8%",
    responseTime: "124ms",
    lastChecked: "2 minutes ago",
    history: [true, true, true, false, true, true, true, true, true, true] // true = up, false = down
  },
  {
    id: 2,
    name: "mystore.io",
    url: "https://mystore.io",
    status: "up",
    uptime: "100%",
    responseTime: "89ms",
    lastChecked: "1 minute ago",
    history: [true, true, true, true, true, true, true, true, true, true]
  },
  {
    id: 3,
    name: "api.service.org",
    url: "https://api.service.org",
    status: "down",
    uptime: "82.3%",
    responseTime: "543ms",
    lastChecked: "Just now",
    history: [false, false, true, true, true, false, false, true, true, false]
  },
  {
    id: 4,
    name: "dashboard.myapp.com",
    url: "https://dashboard.myapp.com",
    status: "up",
    uptime: "99.1%",
    responseTime: "201ms",
    lastChecked: "3 minutes ago",
    history: [true, true, true, true, false, true, true, true, true, true]
  },
];

export default function Dashboard() {
  const [sites, setSites] = useState(websites);
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Website Monitoring</h1>
          <p className="text-gray-500 dark:text-gray-400">Monitor your websites' uptime in real-time</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Website
        </Button>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {sites.map((site) => (
          <Card 
            key={site.id} 
            className="shadow-md transition-all duration-300 hover:shadow-lg hover:translate-y-[-2px]"
          >
            <Accordion type="single" collapsible>
              <AccordionItem value={`site-${site.id}`} className="border-none">
                <AccordionTrigger className="py-0 hover:no-underline">
                  <CardHeader className="py-4 flex flex-row items-center justify-between w-full">
                    <div className="flex items-center">
                      <div 
                        className={`h-4 w-4 rounded-full mr-4 ${
                          site.status === "up" 
                            ? "bg-green-500" 
                            : "bg-red-500"
                        }`}
                      />
                      <div>
                        <CardTitle className="text-lg">{site.name}</CardTitle>
                        <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
                          {site.url}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-8 text-sm text-gray-500 dark:text-gray-400">
                      <div>
                        <div className="font-semibold">Uptime</div>
                        <div>{site.uptime}</div>
                      </div>
                      <div>
                        <div className="font-semibold">Response</div>
                        <div>{site.responseTime}</div>
                      </div>
                      <div>
                        <div className="font-semibold">Last Check</div>
                        <div>{site.lastChecked}</div>
                      </div>
                    </div>
                  </CardHeader>
                </AccordionTrigger>
                
                <AccordionContent>
                  <CardContent className="pt-0">
                    <div className="mb-4">
                      <h3 className="text-md font-semibold mb-2">Uptime Last 30 Minutes</h3>
                      <div className="flex items-center space-x-1">
                        {site.history.map((status, index) => (
                          <div 
                            key={index} 
                            className={`h-8 w-3 rounded-sm ${
                              status ? "bg-green-500" : "bg-red-500"
                            } transition-all hover:h-10 hover:opacity-80`} 
                            title={status ? "Up" : "Down"}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between mt-1 text-xs text-gray-500">
                        <span>30 min ago</span>
                        <span>Now</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <Card className="bg-slate-50 dark:bg-slate-800">
                        <CardContent className="p-4">
                          <div className="text-sm font-semibold">Average Response Time</div>
                          <div className="text-2xl font-bold mt-1">{site.responseTime}</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-slate-50 dark:bg-slate-800">
                        <CardContent className="p-4">
                          <div className="text-sm font-semibold">Uptime Percentage</div>
                          <div className="text-2xl font-bold mt-1">{site.uptime}</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-slate-50 dark:bg-slate-800">
                        <CardContent className="p-4">
                          <div className="text-sm font-semibold">Status</div>
                          <div className="flex items-center mt-1">
                            <div className={`h-3 w-3 rounded-full mr-2 ${
                              site.status === "up" ? "bg-green-500" : "bg-red-500"
                            }`} />
                            <span className="text-2xl font-bold">
                              {site.status === "up" ? "Online" : "Offline"}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="flex justify-end space-x-2 mt-6">
                      <Button variant="outline" size="sm">View Details</Button>
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="destructive" size="sm">Delete</Button>
                    </div>
                  </CardContent>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>
        ))}
      </div>
    </div>
  );
}
