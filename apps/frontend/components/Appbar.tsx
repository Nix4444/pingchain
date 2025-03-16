"use client"
import { SignedIn, SignedOut, SignInButton,SignOutButton,SignUpButton, UserButton} from "@clerk/nextjs";
import { User } from "@clerk/nextjs/server";
export default function Appbar() {
  return (
    <div className="flex justify-between items-center p-4">
      <div>PingChain</div>
      <div>
        <SignedOut>
            <SignInButton />
            <SignUpButton />
        </SignedOut>
        <SignedIn>
            <UserButton/>
            <SignOutButton />
        </SignedIn>
      </div>
    </div>
  );
}