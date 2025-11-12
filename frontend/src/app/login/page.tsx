"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { BookOpen, Sparkles, TrendingUp, Users } from "lucide-react";

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || "/dashboard";

  useEffect(() => {
    if (status === "authenticated") {
      router.push(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-dye-50 via-peach-yellow-50 to-verdigris-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-dye-200 border-t-indigo-dye-600 mb-4"></div>
          <p className="text-gray-700 dark:text-gray-300 font-medium">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding & Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-dye-600 via-indigo-dye-700 to-indigo-dye-800 p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-safety-orange-500 rounded-full opacity-10 blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-verdigris-500 rounded-full opacity-10 blur-3xl translate-y-1/2 -translate-x-1/2"></div>

        {/* Logo & Brand */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">ShelfSpace</h1>
          </div>
          <p className="text-indigo-dye-100 text-lg leading-relaxed max-w-md">
            Your AI-powered book management platform. Organize, track, and
            discover your next great read.
          </p>
        </div>

        {/* Features */}
        <div className="relative z-10 space-y-6">
          <div className="flex items-start gap-4">
            <div className="bg-white/10 backdrop-blur-sm p-2 rounded-lg">
              <Sparkles className="w-5 h-5 text-safety-orange-300" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">
                AI-Powered Insights
              </h3>
              <p className="text-indigo-dye-200 text-sm">
                Get personalized book recommendations and reading analytics
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="bg-white/10 backdrop-blur-sm p-2 rounded-lg">
              <TrendingUp className="w-5 h-5 text-verdigris-300" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">
                Track Your Progress
              </h3>
              <p className="text-indigo-dye-200 text-sm">
                Monitor reading habits and achieve your goals
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="bg-white/10 backdrop-blur-sm p-2 rounded-lg">
              <Users className="w-5 h-5 text-peach-yellow-300" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">
                Join Reading Groups
              </h3>
              <p className="text-indigo-dye-200 text-sm">
                Connect with fellow readers and share insights
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-indigo-dye-300 text-sm">
            © 2024 ShelfSpace. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 via-white to-indigo-dye-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="bg-indigo-dye-600 p-3 rounded-xl">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              ShelfSpace
            </h1>
          </div>

          {/* Login Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 md:p-10">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Welcome Back
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Sign in to continue your reading journey
              </p>
            </div>

            {/* Google Sign In Button */}
            <button
              onClick={() => signIn("google", { callbackUrl })}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-xl border-2 border-gray-300 dark:border-gray-600 shadow-sm transition-all duration-200 ease-in-out hover:shadow-md hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-indigo-dye-500/20 group"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Secure authentication
                </span>
              </div>
            </div>

            {/* Features List */}
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-verdigris-500"></div>
                <span>Access your personal library</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-safety-orange-500"></div>
                <span>Track reading progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-dye-500"></div>
                <span>Get AI-powered recommendations</span>
              </div>
            </div>
          </div>

          {/* Privacy Notice */}
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            By signing in, you agree to our{" "}
            <a
              href="#"
              className="text-indigo-dye-600 dark:text-indigo-dye-400 hover:underline"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="text-indigo-dye-600 dark:text-indigo-dye-400 hover:underline"
            >
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
