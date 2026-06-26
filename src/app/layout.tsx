
import "./globals.css";
import { AppDataProvider } from "@/components/providers/app-data-provider";
import { AppShell } from "@/components/layout/app-shell";

export const metadata = {
  title: "GlobaLeveling",
  description: "Open beta"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AppDataProvider>
          <AppShell>{children}</AppShell>
        </AppDataProvider>
      </body>
    </html>
  );
}
