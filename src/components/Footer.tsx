import React from "react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="w-full bg-zinc-950 border-t border-white/10 pt-16 pb-8 px-8 relative z-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-12">
        {/* Brand Section */}
        <div className="space-y-6 max-w-sm">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-6 h-6">
              <div className="absolute inset-0 rounded-full bg-blue-500 blur-sm opacity-50"></div>
              <div className="w-2 h-2 rounded-full bg-white relative z-10"></div>
            </div>
            <span className="text-lg font-black tracking-tighter uppercase text-white">
              Delay<span className="text-blue-500">Scope</span>
            </span>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed italic">
            "A global mirror reflecting the collective heartbeat of human productivity. Making the invisible struggle with procrastination visible."
          </p>
          <div className="flex gap-4">
            {['Twitter', 'Github', 'Instagram'].map((social) => (
              <a 
                key={social} 
                href="#" 
                className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-blue-400 transition-colors"
              >
                {social}
              </a>
            ))}
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Navigation</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="text-sm text-gray-500 hover:text-white transition-colors">Global Map</Link></li>
              <li><Link href="/insights" className="text-sm text-gray-500 hover:text-white transition-colors">Detailed Insights</Link></li>
              <li><Link href="/about" className="text-sm text-gray-500 hover:text-white transition-colors">About Project</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Resources</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">API Access</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Open Data</a></li>
            </ul>
          </div>
          <div className="space-y-4 col-span-2 md:col-span-1">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Status</h4>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/5">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
               <span className="text-[10px] font-mono text-gray-300">All Systems Operational</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[10px] text-gray-600 font-mono">
          &copy; 2026 DELAYSCOPE LABS. COORDINATES: 21.0285° N, 105.8542° E
        </p>
        <div className="flex items-center gap-6">
           <span className="text-[10px] text-gray-600 uppercase tracking-widest">Built for the Distracted</span>
           <div className="h-4 w-px bg-white/10 hidden md:block"></div>
           <span className="text-[10px] text-gray-600 font-mono uppercase">Ver: 1.0.4-B</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
