import type { Metadata } from "next";
import "./globals.css";
import MobileFrame from "../components/layout/MobileFrame";

export const metadata: Metadata = {
  title: "Quest Mate",
  description: "함께하는 퀘스트, 나만의 방",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <MobileFrame>{children}</MobileFrame>
      </body>
    </html>
  );
}