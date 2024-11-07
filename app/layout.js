import { Inter } from "next/font/google";
import "./ui/globals.css";
import { AuthProvider } from "@/app/contexts/AuthProvider";
import { HydrationProvider } from "./components/HydrationZustand";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "SMP ADVENT TOMPASO",
  description: "Sistem Informasi Akademik",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {" "}
        <AuthProvider>
          <HydrationProvider>{children}</HydrationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
