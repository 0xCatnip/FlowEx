import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/components/providers/Web3Provider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { WalletProvider } from "./context/WalletContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FlowEx - Decentralized Exchange",
  description: "A decentralized exchange with Curve-style AMM implementation",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* <Web3Provider> */}
        <WalletProvider>
          <div className="flex flex-col min-h-screen bg-gradient-to-r from-purple-500 to-blue-500">
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
          {/* </Web3Provider> */}
        </WalletProvider>
      </body>
    </html>
  );
}
