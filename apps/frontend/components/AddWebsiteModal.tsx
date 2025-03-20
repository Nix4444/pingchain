import * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@clerk/nextjs"
import { get } from "http"

interface WebsiteModalProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

export function WebsiteModal({ onClose, onSuccess }: WebsiteModalProps = {}) {
  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { getToken } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      setError("URL is required");
      return;
    }
    if(!alias){
        setError("Alias is required");
        return
    }

    try {
      setIsSubmitting(true);
      setError("");
      
      const token = await getToken();
      if(!token){
        setError("Unauthorized")
        return;
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_EXPRESS_BACKEND_URL}/api/website`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token
        },
        body: JSON.stringify({ url, alias: alias}),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error("Failed to add website");
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-[450px]">
      <CardHeader>
        <CardTitle>Add Website to Monitor</CardTitle>
        <CardDescription>Enter the details of the website you want to monitor.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="url">URL</Label>
              <Input 
                id="url" 
                placeholder="https://example.com" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="alias">Alias</Label>
              <Input 
                id="alias" 
                placeholder="My Website" 
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSubmit(e);
                  }
                }}
                required
              />
            </div>
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" className="cursor-pointer" onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting}
          className="cursor-pointer"
        >
          {isSubmitting ? "Adding..." : "Add Website"}
        </Button>
      </CardFooter>
    </Card>
  )
}
