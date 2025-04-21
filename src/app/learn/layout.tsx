import type React from "react";

export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
        {children}
      </main>
    </div>
  );
}
