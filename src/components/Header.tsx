import React from "react";
import Link from "next/link";

const Header = () => {
  return (
    <header className="w-full shrink-0 flex items-center justify-between px-8 py-5 bg-zinc-950 border-b border-white/10 relative z-20">
      <Link href="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
        <div className="relative flex items-center justify-center w-8 h-8">
          <div className="absolute inset-0 rounded-full bg-blue-500 blur-sm opacity-70 animate-pulse"></div>
          <div className="w-3 h-3 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] relative z-10"></div>
        </div>
        <h1 className="text-xl font-bold tracking-wider text-white drop-shadow-md uppercase flex items-center gap-2">
          <span>
            Delay<span className="bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent font-medium">Scope</span>
          </span>
          <span className="px-1.5 py-0.5 rounded-md bg-blue-500/20 border border-blue-500/50 text-blue-400 text-[9px] font-black tracking-widest">
            BETA
          </span>
        </h1>
      </Link>

      <nav className="hidden md:flex items-center gap-8">
        <Link
          href="/insights"
          className="text-sm font-medium text-gray-400 hover:text-white transition-colors duration-300"
        >
          Insights
        </Link>
        <Link
          href="/about"
          className="text-sm font-medium text-gray-400 hover:text-white transition-colors duration-300"
        >
          About
        </Link>
      </nav>
    </header>
  );
};

export default Header;
