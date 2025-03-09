import React, { useState, useRef, useEffect, useCallback } from "react";
import { Search, Loader2 } from "lucide-react";

function App() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLeetCodeSelected, setIsLeetCodeSelected] = useState(true);
  const [isCodeForcesSelected, setIsCodeForcesSelected] = useState(false);
  const [isCodeChefSelected, setIsCodeChefSelected] = useState(false);
  const [displayedResults, setDisplayedResults] = useState([]);
  const resultsPerPage = 10;
  const observerTarget = useRef(null);
  const scrollContainerRef = useRef(null);
  const [filteredResults, setFilteredResults] = useState([]);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSearch = async () => {
    setResponse(null);
    setIsLoading(true);
    setDisplayedResults([]);
    setFilteredResults([]);

    try {
      const data = await fetch(
        "http://localhost:5000/api/search",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query }),
        }
      );
      const outputList = await data.json();
      setResponse(outputList);
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter results when response or platform selection changes
  useEffect(() => {
    if (!response?.results) {
      setFilteredResults([]);
      return;
    }

    const filtered = response.results.filter((value) => {
      const [link] = value.split("*");
      return (
        (isLeetCodeSelected && link.includes("leetcode")) ||
        (isCodeForcesSelected && link.includes("codeforces")) ||
        (isCodeChefSelected && link.includes("codechef"))
      );
    });

    setFilteredResults(filtered);
    setDisplayedResults(filtered.slice(0, resultsPerPage));
  }, [response, isLeetCodeSelected, isCodeForcesSelected, isCodeChefSelected]);

  const loadMoreResults = useCallback(() => {
    if (displayedResults.length >= filteredResults.length) return;
    
    const nextBatch = filteredResults.slice(
      displayedResults.length,
      displayedResults.length + resultsPerPage
    );
    
    setDisplayedResults(prev => [...prev, ...nextBatch]);
  }, [displayedResults.length, filteredResults]);

  // Intersection Observer setup
  useEffect(() => {
    if (!observerTarget.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayedResults.length < filteredResults.length) {
          loadMoreResults();
        }
      },
      { 
        root: scrollContainerRef.current,
        threshold: 0.1 
      }
    );

    observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [displayedResults.length, filteredResults.length, loadMoreResults]);

  const platformConfig = [
    {
      label: "LeetCode",
      state: isLeetCodeSelected,
      setState: setIsLeetCodeSelected,
      logo: "https://assets.leetcode.com/static_assets/public/icons/favicon-192x192.png",
      color: "text-yellow-400",
      url: "https://leetcode.com",
      bgColor: "bg-yellow-400/10"
    },
    {
      label: "CodeForces",
      state: isCodeForcesSelected,
      setState: setIsCodeForcesSelected,
      logo: "https://codeforces.org/s/0/favicon-96x96.png",
      color: "text-red-400",
      url: "https://codeforces.com",
      bgColor: "bg-red-400/10"
    },
    {
      label: "CodeChef",
      state: isCodeChefSelected,
      setState: setIsCodeChefSelected,
      logo: "https://cdn.codechef.com/images/cc-logo.svg",
      color: "text-orange-400",
      url: "https://codechef.com",
      bgColor: "bg-orange-400/10"
    }
  ];

  return (
    <div className="min-h-screen space-bg text-white px-4 py-8 relative">
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-8 neon-glow bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            AlgoSearch
          </h1>
          
          {/* Platform Logos */}
          <div className="flex justify-center gap-16 mb-12">
            {platformConfig.map(({ label, logo, color, url, bgColor }) => (
              <a
                key={label}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="platform-logo group transform hover:scale-110 transition-all duration-300"
              >
                <div className={`platform-icon ${bgColor} ${color} w-24 h-24 flex items-center justify-center rounded-3xl backdrop-blur-sm border border-gray-700/30 group-hover:border-gray-600/50 transition-all duration-300 shadow-lg`}>
                  <img src={logo} alt={label} className="w-16 h-16 object-contain" />
                </div>
                <span className="mt-3 block text-lg font-medium text-gray-300 group-hover:text-white transition-colors">
                  {label}
                </span>
              </a>
            ))}
          </div>
          
          <p className="text-gray-300 text-xl">
            Search for coding problems from top platforms
          </p>
        </div>

        {/* Search Box */}
        <div className="relative mb-8">
          <div className="flex items-center bg-gray-800/30 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg border border-gray-700/30">
            <input
              type="text"
              value={query}
              onChange={handleInputChange}
              placeholder="Search for coding problems..."
              className="flex-1 px-6 py-5 bg-transparent text-white placeholder-gray-400 focus:outline-none search-input-glow text-lg"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              className="px-8 py-5 bg-blue-600 hover:bg-blue-500 transition-all duration-300 flex items-center group"
            >
              <Search className="w-6 h-6 mr-2 group-hover:scale-110 transition-transform" />
              <span className="text-lg">Search</span>
            </button>
          </div>
        </div>

        {/* Platform Filters */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          {platformConfig.map(({ label, state, setState, logo, color }) => (
            <label
              key={label}
              className={`${state ? 'bg-green-600/20 ring-2 ring-green-500/50 checkbox-glow' : 'bg-gray-800/30'} 
                flex items-center space-x-3 px-5 py-3 rounded-xl cursor-pointer 
                hover:bg-gray-700/30 transition-all duration-300 backdrop-blur-sm border border-gray-700/30`}
            >
              <input
                type="checkbox"
                checked={state}
                onChange={() => setState(!state)}
                className="hidden"
              />
              <img src={logo} alt={label} className="w-8 h-8 object-contain" />
              <span className={`${state ? 'text-green-400' : 'text-gray-300'} font-medium text-lg`}>
                {label}
              </span>
            </label>
          ))}
        </div>

        {/* Search Results */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/30 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <span className="ml-3 text-gray-400 text-lg">Searching...</span>
            </div>
          ) : (
            <>
              {displayedResults.length > 0 ? (
                <div ref={scrollContainerRef} className="max-h-[600px] overflow-y-auto custom-scrollbar">
                  <div className="space-y-4 p-6">
                    {displayedResults.map((value, index) => {
                      const [link, title] = value.split("*");
                      const platform = link.includes("leetcode") ? "LeetCode" :
                                     link.includes("codeforces") ? "CodeForces" : "CodeChef";
                      const platformLogo = platformConfig.find(p => p.label === platform)?.logo;
                      
                      return (
                        <a
                          key={index}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block bg-gray-800/50 rounded-xl p-6 hover:bg-gray-700/50 
                            transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl border border-gray-700/30"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <img src={platformLogo} alt={platform} className="w-6 h-6 object-contain" />
                              <h3 className="text-lg font-semibold text-white">{title}</h3>
                            </div>
                            <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                              platform === "LeetCode" ? "bg-yellow-900/30 text-yellow-400" :
                              platform === "CodeForces" ? "bg-red-900/30 text-red-400" :
                              "bg-orange-900/30 text-orange-400"
                            }`}>
                              {platform}
                            </span>
                          </div>
                        </a>
                      );
                    })}
                    
                    {/* Infinite Scroll Observer */}
                    {displayedResults.length < filteredResults.length && (
                      <div ref={observerTarget} className="h-10 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                response && (
                  <div className="text-center py-12">
                    <p className="text-gray-400 text-lg">
                      No results found. Try a different keyword.
                    </p>
                  </div>
                )
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;