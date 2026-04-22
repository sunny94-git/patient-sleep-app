"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BarChart3, Pill, ClipboardCheck, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/home", label: "홈", icon: Home },
  { href: "/records", label: "기록", icon: BarChart3 },
  { href: "/prescription", label: "처방", icon: Pill },
  { href: "/isi", label: "자가진단", icon: ClipboardCheck },
  { href: "/qna", label: "문의", icon: MessageCircle },
];

export function BottomTabBar() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white/95 backdrop-blur-md border-t border-gray-200 flex justify-around items-center px-2 z-50"
      style={{ height: "calc(56px + env(safe-area-inset-bottom))", paddingBottom: "env(safe-area-inset-bottom)" }}>
      {tabs.map(({ href, label, icon: Icon }) => {
        const isActive = pathname.startsWith(href);
        return (
          <Link key={href} href={href}
            className={cn("flex flex-col items-center justify-center gap-1 transition-colors min-w-[64px] min-h-[44px]",
              isActive ? "text-brand-500" : "text-gray-400")}>
            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[11px] font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
