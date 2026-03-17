import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function InsightsPage() {
  // Mock data for the detailed insights
  const stats = [
    { label: "Total Active Users", value: "1.2M", trend: "+15%", color: "text-blue-400" },
    { label: "Hours Saved Globally", value: "852k", trend: "+8.2%", color: "text-green-400" },
    { label: "Avg Focus Span", value: "42m", trend: "-2.4%", color: "text-amber-400" },
    { label: "Global Guilt Index", value: "68/100", trend: "+5.1%", color: "text-red-400" },
  ];

  const rankings = [
    { country: "Japan", focus: 82, status: "Hall of Fame", flag: "🇯🇵" },
    { country: "Germany", focus: 78, status: "Hall of Fame", flag: "🇩🇪" },
    { country: "Vietnam", focus: 75, status: "Hall of Fame", flag: "🇻🇳" },
    { country: "USA", focus: 45, status: "Wall of Shame", flag: "🇺🇸" },
    { country: "Brazil", focus: 38, status: "Wall of Shame", flag: "🇧🇷" },
    { country: "Italy", focus: 32, status: "Wall of Shame", flag: "🇮🇹" },
  ];

  return (
    <main className="w-screen h-screen bg-black overflow-y-auto font-sans text-white flex flex-col relative custom-scrollbar">

      <div className="flex-1 max-w-6xl mx-auto px-8 py-16 w-full">
        <header className="mb-16 space-y-4 text-center">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter animate-fade-in-up">
            World <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-purple-500">Focus Report</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto animate-fade-in-up delay-100 italic">
            "An analytical deep dive into the collective heartbeat of human productivity."
          </p>
        </header>

        {/* Top Dash Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 animate-fade-in-up delay-200">
          {stats.map((stat, i) => (
            <div key={i} className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 backdrop-blur-xl hover:border-blue-500/30 transition-all group">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2 group-hover:text-gray-300">
                {stat.label}
              </p>
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-black ${stat.color}`}>{stat.value}</span>
                <span className="text-[10px] text-green-500 font-bold">{stat.trend}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Main Chart Area (Simulated) */}
          <div className="lg:col-span-2 bg-zinc-900/50 border border-white/10 rounded-3xl p-8 backdrop-blur-xl animate-fade-in-up delay-300">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-xl font-bold tracking-tight">Focus Trends (24h)</h2>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-[10px] uppercase text-gray-500 font-bold tracking-widest">Focus</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-[10px] uppercase text-gray-500 font-bold tracking-widest">Delay</span>
                </div>
              </div>
            </div>

            {/* Simulated Chart Bars */}
            <div className="flex items-end justify-between h-64 gap-2 px-4 border-b border-white/5 pb-2">
              {[45, 60, 80, 55, 30, 90, 75, 40, 65, 85, 30, 20].map((h, i) => (
                <div key={i} className="flex-1 group relative h-full flex flex-col justify-end">
                  <div 
                    className="w-full bg-linear-to-t from-blue-600/80 to-blue-400/80 rounded-t-sm group-hover:from-blue-400 group-hover:to-blue-300 transition-all cursor-crosshair relative border-x border-white/10"
                    style={{ height: `${h}%` }}
                  >
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-[0_4px_12px_rgba(59,130,246,0.5)] whitespace-nowrap z-30 scale-75 group-hover:scale-100">
                      {h}k logs
                    </div>
                  </div>
                  <div 
                    className="w-full bg-linear-to-t from-red-600/60 to-red-400/60 rounded-b-sm mt-1 opacity-50 group-hover:opacity-100 transition-all border-x border-white/10"
                    style={{ height: `${(100 - h) / 1.5}%` }} // Adjusted for visibility
                  ></div>
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[9px] text-gray-400 font-mono tracking-tighter opacity-70 group-hover:opacity-100">
                    {i * 2}h
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Regional Leaderboard */}
          <div className="bg-zinc-900/50 border border-white/10 rounded-3xl p-8 backdrop-blur-xl animate-fade-in-up delay-400">
            <h2 className="text-xl font-bold tracking-tight mb-8">Focus Index</h2>
            <div className="space-y-6">
              {rankings.map((target, i) => (
                <div key={i} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <span className="text-xl grayscale group-hover:grayscale-0 transition-all">{target.flag}</span>
                    <div>
                      <p className="text-sm font-bold text-gray-200">{target.country}</p>
                      <p className={`text-[9px] uppercase font-black tracking-widest ${target.status === 'Hall of Fame' ? 'text-green-500' : 'text-red-500 animate-pulse'}`}>
                        {target.status}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black">{target.focus}%</p>
                    <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden mt-1">
                      <div 
                        className={`h-full rounded-full ${target.focus > 60 ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`}
                        style={{ width: `${target.focus}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Global Excuse Cloud */}
        <div className="grid md:grid-cols-2 gap-8 animate-fade-in-up delay-500">
           <div className="bg-zinc-900/50 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
             <h2 className="text-xl font-bold tracking-tight mb-6 flex items-center gap-2">
               <span className="text-red-500">🔥</span> Global Distraction Cloud
             </h2>
             <div className="flex flex-wrap gap-2">
                {[
                  { tag: "Watching Anime", size: "text-2xl", weight: "font-black" },
                  { tag: "Tiktok", size: "text-3xl", weight: "font-black" },
                  { tag: "Tea Break", size: "text-lg", weight: "font-bold" },
                  { tag: "Youtube Shorts", size: "text-xl", weight: "font-bold" },
                  { tag: "Staring at Wall", size: "text-sm", weight: "font-medium" },
                  { tag: "Making 5th Coffee", size: "text-lg", weight: "font-bold" },
                  { tag: "Online Shopping", size: "text-2xl", weight: "font-black" },
                  { tag: "Instagram Reels", size: "text-xl", weight: "font-bold" },
                  { tag: "Cleaning Desktop", size: "text-xs", weight: "font-light" },
                  { tag: "Arguing on Twitter", size: "text-lg", weight: "font-bold" },
                ].map((tag, i) => (
                  <span key={i} className={`${tag.size} ${tag.weight} text-white/40 hover:text-red-400 transition-colors cursor-default px-2 py-1`}>
                    {tag.tag}
                  </span>
                ))}
             </div>
           </div>

           <div className="bg-linear-to-br from-blue-600 to-purple-700 rounded-3xl p-0.5 transition-transform hover:scale-[1.01]">
              <div className="bg-black w-full h-full rounded-3xl p-8 flex flex-col justify-center items-center text-center space-y-6">
                 <h2 className="text-3xl font-black tracking-tighter">Are you delaying right now?</h2>
                 <p className="text-gray-400 text-sm italic">"The analysis shows that 42% of our readers are actually procrastinating while reading these insights."</p>
                 <Link 
                    href="/"
                    className="px-8 py-3 bg-white text-black font-black rounded-full hover:bg-gray-200 transition-all uppercase tracking-widest text-xs"
                  >
                    Go Log a Focus Session
                 </Link>
              </div>
           </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
