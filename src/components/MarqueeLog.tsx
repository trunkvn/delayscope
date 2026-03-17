import React from 'react'

const MarqueeLog = ({isMapLoaded}: {isMapLoaded: boolean}) => {
  return (
      <div
          className={`absolute bottom-8 left-8 right-[430px] z-30 flex flex-col gap-2 pointer-events-none delay-300 ${isMapLoaded ? "animate-fade-in-up" : "opacity-0"}`}
        >
          {/* Static Title ABOVE the bar */}
          <div className="flex items-center gap-2 pl-4">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
            <span className="text-[10px] text-gray-300 uppercase tracking-widest font-bold drop-shadow-md">
              Global Action Log
            </span>
          </div>

          {/* Scrollable Marquee Box */}
          <div className="h-10 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full overflow-hidden flex items-center shadow-[0_0_30px_rgba(0,0,0,0.8)] pointer-events-auto">
            <div className="flex items-center h-full w-max animate-marquee">
              {/* Loop array twice to ensure seamless infinite scroll */}
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex items-center shrink-0">
                  <span className="text-[11px] font-medium text-gray-300 px-6 border-r border-white/10 whitespace-nowrap">
                    🇯🇵 Tokyo:{" "}
                    <span className="text-red-400">
                      Delaying (Watching Anime)
                    </span>
                  </span>
                  <span className="text-[11px] font-medium text-gray-300 px-6 border-r border-white/10 whitespace-nowrap">
                    🇺🇸 New York:{" "}
                    <span className="text-green-400">Focused (Coding)</span>
                  </span>
                  <span className="text-[11px] font-medium text-gray-300 px-6 border-l border-white/10 whitespace-nowrap">
                    🇻🇳 Hanoi:{" "}
                    <span className="text-red-400">
                      Delaying (Drinking Iced Coffee)
                    </span>
                  </span>
                  <span className="text-[11px] font-medium text-gray-300 px-6 border-l border-white/10 whitespace-nowrap">
                    🇩🇪 Berlin:{" "}
                    <span className="text-green-400">Focused (Deep Work)</span>
                  </span>
                  <span className="text-[11px] font-medium text-gray-300 px-6 border-l border-white/10 whitespace-nowrap">
                    🇬🇧 London:{" "}
                    <span className="text-red-400">Delaying (Tea Break)</span>
                  </span>
                  <span className="text-[11px] font-medium text-gray-300 px-6 border-l border-white/10 whitespace-nowrap">
                    🇦🇺 Sydney:{" "}
                    <span className="text-green-400">
                      Focused (Analyzing Data)
                    </span>
                  </span>
                  <span className="text-[11px] font-medium text-gray-300 px-6 border-l border-white/10 whitespace-nowrap">
                    🇫🇷 Paris:{" "}
                    <span className="text-red-400">
                      Delaying (Eating Croissant)
                    </span>
                  </span>
                  <span className="text-[11px] font-medium text-gray-300 px-6 border-l border-white/10 whitespace-nowrap">
                    🇧🇷 Sao Paulo:{" "}
                    <span className="text-red-400">Delaying (Dancing)</span>
                  </span>
                  <span className="text-[11px] font-medium text-gray-300 px-6 border-l border-white/10 whitespace-nowrap">
                    🇨🇳 Beijing:{" "}
                    <span className="text-green-400">Focused (Studying)</span>
                  </span>
                  <span className="text-[11px] font-medium text-gray-300 px-6 border-l border-white/10 whitespace-nowrap">
                    🇰🇷 Seoul:{" "}
                    <span className="text-red-400">
                      Delaying (Listening to K-Pop)
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
  )
}

export default MarqueeLog