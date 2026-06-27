import "./globals.css";
import { AppDataProvider } from "@/components/providers/app-data-provider";
import { AppShell } from "@/components/layout/app-shell";

export const metadata = {
  title: "GlobaLeveling",
  description: "Open beta",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/effects/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/effects/icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [
      { url: "/effects/icon-192.png", sizes: "192x192", type: "image/png" }
    ]
  }
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
