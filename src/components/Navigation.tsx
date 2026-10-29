"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "홈", icon: "🏠" },
  { href: "/immediate", label: "즉시대응", icon: "⚡" },
  { href: "/practice", label: "연습", icon: "🎙️" },
  { href: "/learn", label: "사례학습", icon: "📚" },
  { href: "/wellness", label: "마음지키기", icon: "💚" },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <>
      {/* PC Top Navigation */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 w-full flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🛡️</span>
            <div>
              <div className="text-lg font-bold text-blue-700 leading-tight">마음지킴 AI</div>
              <div className="text-xs text-slate-400 leading-tight">민원 응대는 똑똑하게</div>
            </div>
          </Link>
          <div className="flex items-center gap-1">
            {navItems.slice(1).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 safe-bottom">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg flex-1 transition-colors ${
                pathname === item.href
                  ? "text-blue-700"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
