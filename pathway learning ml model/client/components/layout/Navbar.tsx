import { BrainCircuit, Search, LogOut, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  const handleLogout = async () => {
    await logout();
    setShowDropdown(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-20 items-center justify-between px-6">
        {/* Logo & Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-400 shadow-lg shadow-purple-500/50 transition-all group-hover:shadow-purple-500/70 group-hover:scale-105">
            <BrainCircuit size={24} className="text-white" />
          </div>
          <div className="hidden md:block">
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              LearnPath AI
            </h1>
            <p className="text-xs text-foreground/50">Personalized Learning</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          <Link
            to="/"
            className="text-sm font-medium text-foreground/80 hover:text-purple-400 transition-colors"
          >
            Home
          </Link>
          <Link
            to="/learning-path"
            className="text-sm font-medium text-foreground/80 hover:text-cyan-400 transition-colors"
          >
            Generate Path
          </Link>
          <Link
            to="/dashboard"
            className="text-sm font-medium text-foreground/80 hover:text-purple-400 transition-colors"
          >
            Dashboard
          </Link>
          <Link
            to="/community"
            className="text-sm font-medium text-foreground/80 hover:text-cyan-400 transition-colors"
          >
            Community
          </Link>
          <Link
            to="/mentorship"
            className="text-sm font-medium text-foreground/80 hover:text-purple-400 transition-colors"
          >
            Mentorship
          </Link>
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          {/* Search Bar - Hidden on mobile */}
          <div className="hidden xl:flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-foreground/70 backdrop-blur-sm w-64">
            <Search size={16} className="text-foreground/50" />
            <input
              className="w-full bg-transparent outline-none placeholder:text-foreground/40"
              placeholder="Search courses..."
            />
          </div>

          {/* User Menu or Auth Buttons */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 hover:bg-white/10 transition-all"
              >
                <img
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || user.email}&background=6366f1&color=fff`}
                  alt={user.displayName || "User"}
                  className="h-8 w-8 rounded-full border-2 border-purple-400/50"
                />
                <span className="hidden md:block text-sm font-medium text-foreground">
                  {user.displayName || "User"}
                </span>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-3 w-56 glass rounded-2xl border border-white/10 p-3 shadow-2xl z-50">
                  <div className="px-3 py-3 border-b border-white/10">
                    <p className="text-sm font-semibold text-white">{user.displayName || "User"}</p>
                    <p className="text-xs text-foreground/60 truncate mt-1">{user.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full mt-2 flex items-center gap-2 px-3 py-2.5 text-sm text-foreground/80 hover:bg-white/10 rounded-xl transition-all"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/signin"
                className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-foreground/80 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/signin?mode=signup"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-400 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="lg:hidden p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
          >
            {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="lg:hidden border-t border-white/10 bg-background/95 backdrop-blur-xl">
          <nav className="container mx-auto px-6 py-6 flex flex-col gap-4">
            <Link
              to="/"
              onClick={() => setShowMobileMenu(false)}
              className="text-sm font-medium text-foreground/80 hover:text-purple-400 transition-colors py-2"
            >
              Home
            </Link>
            <Link
              to="/learning-path"
              onClick={() => setShowMobileMenu(false)}
              className="text-sm font-medium text-foreground/80 hover:text-cyan-400 transition-colors py-2"
            >
              Generate Path
            </Link>
            <Link
              to="/dashboard"
              onClick={() => setShowMobileMenu(false)}
              className="text-sm font-medium text-foreground/80 hover:text-purple-400 transition-colors py-2"
            >
              Dashboard
            </Link>
            <Link
              to="/community"
              onClick={() => setShowMobileMenu(false)}
              className="text-sm font-medium text-foreground/80 hover:text-cyan-400 transition-colors py-2"
            >
              Community
            </Link>
            <Link
              to="/mentorship"
              onClick={() => setShowMobileMenu(false)}
              className="text-sm font-medium text-foreground/80 hover:text-purple-400 transition-colors py-2"
            >
              Mentorship
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
