import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "수면장애 클리닉",
  description: "원광대학교 광주한방병원 수면장애 클리닉 환자 관리 앱",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "수면장애 클리닉" },
};

export const viewport: Viewport = {
  width: "device-width", initialScale: 1, maximumScale: 1,
  userScalable: false, viewportFit: "cover", themeColor: "#4A90D9",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
