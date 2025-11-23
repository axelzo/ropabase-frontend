import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-gradient-to-b from-blue-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 p-8">
      <main className="max-w-5xl w-full text-center relative">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/hero-bg.jpg"
            alt="Background"
            layout="fill"
            objectFit="cover"
            className="opacity-20 dark:opacity-10"
          />
        </div>

        <h1 className="text-5xl sm:text-6xl font-extrabold mb-6 text-slate-900 dark:text-white">
          Welcome to RopaBase
        </h1>
        <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 mb-8">
          Your ultimate solution for managing dashboards with ease and style.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
          <Link
            href="/register"
            className="rounded-lg bg-blue-600 text-white px-8 py-4 font-medium text-lg shadow-lg hover:bg-blue-500 hover:shadow-xl transition-all"
          >
            Get Started
          </Link>

          <Link
            href="/login"
            className="rounded-lg border border-blue-600 text-blue-600 px-8 py-4 font-medium text-lg hover:bg-blue-50 dark:hover:bg-slate-800 hover:shadow-md transition-all"
          >
            Log In
          </Link>

          <Link
            href="/dashboard"
            className="rounded-lg px-8 py-4 text-blue-600 dark:text-blue-400 underline font-medium text-lg hover:text-blue-800 dark:hover:text-blue-200"
          >
            Explore Dashboard
          </Link>
        </div>
      </main>

      <footer className="mt-12 text-sm text-slate-500 dark:text-slate-400">
        <p>© 2025 RopaBase. All rights reserved.</p>
        <p>
          <Link href="/privacy" className="hover:underline">
            Privacy Policy
          </Link>{" "}
          |{" "}
          <Link href="/terms" className="hover:underline">
            Terms of Service
          </Link>
        </p>
      </footer>
    </div>
  );
}
