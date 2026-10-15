// ```jsx
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "CST HUB | Dinajpur Polytechnic",
    template: "%s | CST HUB",
  },
  description:
    "CST HUB is a student learning platform for Computer Science and Technology students at Dinajpur Polytechnic.",
  applicationName: "CST HUB",
  icons: {
    icon: "/images (1).png",
    shortcut: "/images (1).png",
    apple: "/images (1).png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-slate-950 text-slate-100">
        <Navbar />

        <main className="flex min-h-screen flex-col">
          {children}
        </main>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#151124",
              color: "#ffffff",
              border: "1px solid rgba(129, 140, 248, 0.25)",
              borderRadius: "12px",
            },
          }}
        />
      </body>
    </html>
  );
}
