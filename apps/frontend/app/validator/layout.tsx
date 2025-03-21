import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Become a Validator | Pingchain",
  description: "Earn rewards by validating website uptime with Pingchain's validator network.",
};

export default function ValidatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12">
      {children}
    </section>
  );
} 