import Link from "next/link";
import { ArrowRight, Lock, Zap, BarChart3 } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-slate-50 to-slate-50 dark:from-blue-950/40 dark:via-slate-950 dark:to-slate-950"></div>
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center text-center space-y-8">
              <div className="space-y-4 max-w-3xl">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                  Manage your wardrobe <br className="hidden sm:inline" />
                  <span className="text-blue-600 dark:text-blue-500">
                    with style & ease
                  </span>
                </h1>
                <p className="mx-auto max-w-[700px] text-slate-600 dark:text-slate-400 md:text-xl/relaxed lg:text-2xl/relaxed">
                  The ultimate dashboard for organizing your clothing inventory,
                  tracking styles, and optimizing your daily outfits.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Link
                  href="/register"
                  className="inline-flex h-12 items-center justify-center rounded-lg bg-blue-600 px-8 text-base font-medium text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-700"
                >
                  Start for Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/"
                  className="inline-flex h-12 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-8 text-base font-medium shadow-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-300"
                >
                  View Demo
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24 bg-white dark:bg-slate-900">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Everything you need
              </h2>
              <p className="mt-4 text-slate-500 dark:text-slate-400 md:text-lg">
                Powerful features to help you take control of your wardrobe.
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="flex flex-col items-center text-center p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                  <BarChart3 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Smart Analytics</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Visualize your wardrobe statistics. Know what you wear most
                  and what gathers dust.
                </p>
              </div>
              {/* Feature 2 */}
              <div className="flex flex-col items-center text-center p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-4">
                  <Zap className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Fast Organization</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Quickly categorize and tag your items. Find exactly what you
                  need in seconds.
                </p>
              </div>
              {/* Feature 3 */}
              <div className="flex flex-col items-center text-center p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-full mb-4">
                  <Lock className="h-8 w-8 text-teal-600 dark:text-teal-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Secure & Private</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Your data is encrypted and safe. Only you have access to your
                  personal wardrobe data.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-blue-600 dark:bg-blue-700">
          <div className="container px-4 md:px-6 mx-auto text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white mb-6">
              Ready to organize your style?
            </h2>
            <p className="text-blue-100 md:text-xl mb-8 max-w-2xl mx-auto">
              Join thousands of users who have transformed their wardrobe
              management with RopaBase.
            </p>
            <Link
              href="/register"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-white text-blue-600 px-8 text-base font-bold shadow-lg transition-all hover:bg-blue-50 hover:scale-105"
            >
              Get Started Now
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-12">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-blue-600" />
                <span className="text-xl font-bold">RopaBase</span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Simplifying wardrobe management for everyone.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <li>
                  <Link
                    href="#"
                    className="hover:text-blue-600 transition-colors"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-blue-600 transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-blue-600 transition-colors"
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <li>
                  <Link
                    href="#"
                    className="hover:text-blue-600 transition-colors"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-blue-600 transition-colors"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-blue-600 transition-colors"
                  >
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <li>
                  <Link
                    href="/privacy"
                    className="hover:text-blue-600 transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="hover:text-blue-600 transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 text-center text-sm text-slate-500 dark:text-slate-400">
            <p>© {new Date().getFullYear()} RopaBase. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
