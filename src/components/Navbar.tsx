"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import Image from "next/image";
import { LogOut } from "lucide-react";

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div>
            <Image src="/favicon.svg" alt="Logo" width={50} height={50} />
          </div>

          <Link
            href="/"
            className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400"
          >
            RopaBase
          </Link>
        </div>
        <nav className="flex items-center gap-4 sm:gap-6">
          {!isAuthenticated ? (
            <>
              <Link
                href="/about"
                className="text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                About
              </Link>
              <Link
                href="/login"
                className="text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="hidden sm:inline-flex h-9 items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-700 disabled:pointer-events-none disabled:opacity-50"
              >
                Get Started
              </Link>
            </>
          ) : (
            <button
              onClick={logout}
              className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 sm:px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-300"
            >
              <LogOut className="h-4 w-4 sm:hidden" />
              <span className="hidden sm:inline">Log Out</span>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
