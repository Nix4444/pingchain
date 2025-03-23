"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center min-h-screen">
      <section className="w-full py-12 md:py-24 lg:py-32 flex flex-col items-center text-center px-4">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400 pb-4">
          Pingchain
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-3xl">
          Decentralized uptime monitoring powered by the blockchain
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button className="text-lg px-8 py-6 cursor-pointer" onClick={() => router.push("/dashboard")}>Add Your Website</Button>
          <Button variant="outline" className="text-lg px-8 py-6 cursor-pointer" onClick={() => router.push("/validator")}>Become a Validator</Button>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 bg-slate-50 dark:bg-slate-900" id="features">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How Pingchain Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                  <line x1="3" x2="21" y1="9" y2="9"></line>
                  <path d="m9 16 2 2 4-4"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Register Your Website</h3>
              <p className="text-slate-600 dark:text-slate-300">Add your website to our decentralized monitoring network with just a few clicks.</p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
                  <path d="m9 12 2 2 4-4"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Distributed Validation</h3>
              <p className="text-slate-600 dark:text-slate-300">Our network of validators continuously checks your site&apos;s uptime from multiple locations.</p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
              <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Crypto Rewards</h3>
              <p className="text-slate-600 dark:text-slate-300">Validators earn crypto for their monitoring services, creating a sustainable ecosystem.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-12">Join Our Validation Network</h2>
          <div className="bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950 dark:to-teal-950 p-8 rounded-xl mb-8 max-w-3xl mx-auto">
            <h3 className="text-2xl font-semibold mb-4">Earn Crypto While Keeping the Web Reliable</h3>
            <p className="mb-6">Run a validator node and get paid for monitoring website uptime. Help build a more reliable internet while earning crypto rewards.</p>
            <Button className="bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-50 cursor-pointer" onClick={() => router.push("/validator")}>
              Become a Validator
            </Button>
          </div>
          
          <div className="mt-16">
            <h3 className="text-2xl font-semibold mb-4">For Website Owners</h3>
            <p className="max-w-2xl mx-auto mb-6">Get reliable, decentralized monitoring for your websites. No single point of failure, transparent uptime reporting.</p>
            <Button variant="outline" className="border-2 cursor-pointer" onClick={() => router.push("/dashboard")}>
              Add Your Website
            </Button>
          </div>
        </div>
      </section>

      <footer className="w-full py-12 bg-slate-900 text-slate-300">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <h3 className="text-xl font-bold text-white mb-4">Pingchain</h3>
              <p className="mb-4">Decentralized uptime monitoring powered by blockchain technology.</p>
              <div className="flex space-x-4">
                <a href="https://github.com/Nix4444/pingchain" target="_blank" className="text-slate-300 hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-700 mt-12 pt-8 flex flex-col md:flex-row justify-center items-center">
            <p className="mt-4 md:mt-0">Made with ❤️ for the decentralized web</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
