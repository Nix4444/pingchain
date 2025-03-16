import Image from "next/image";
import { Button } from "@/components/ui/button";
export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1>Hello World</h1>
      <Button className="cursor-pointer">Click me</Button>
    </div>
  );
}
