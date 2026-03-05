import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";

import {BASE_URL} from "../../url.ts"




type LoginResponse = {
  token: string;
  user: {
    id: number;
    email: string;
    first_name?: string;
    last_name?: string;
    role?: string;
    avatar_url?: string;
  };
};

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const navigate = useNavigate();


  // const API_BASE = "http://localhost:8080";\\//\

// import { BASE_URL } from "";



  const API_BASE = BASE_URL
  console.log("API BASE", API_BASE)


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setErrorMsg("Email and password are required.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          password: cleanPassword,
        }),
      });

      const data = (await res.json().catch(() => null)) as any;

      if (!res.ok) {
        setErrorMsg(data?.message || "Login failed. Check your credentials.");
        return;
      }

      const payload = data as LoginResponse;

      // ✅ Store token
      // If "Keep me logged in" checked -> localStorage, else sessionStorage
      const storage = isChecked ? localStorage : sessionStorage;
      storage.setItem("auth_token", payload.token);
      storage.setItem("me", JSON.stringify(payload.user));

      // ✅ Go to dashboard (change route if you want)
      navigate("/");
    } catch (err) {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col flex-1">
      <div className="w-full max-w-md pt-10 mx-auto">
        {/* <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5" />
          Back to dashboard
        </Link> */}
      </div>

      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            {/* <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to sign in!
            </p> */}
          </div>

          <div>
            {/* Social buttons (optional: wire later) */}
   

            {/* ✅ Sign in form wired to API */}
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {errorMsg && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
                    {errorMsg}
                  </div>
                )}

                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input
                    placeholder="info@gmail.com"
                    value={email}
                    onChange={(e: any) => setEmail(e.target.value)}
                    //autoComplete="email"
                  />
                </div>

                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e: any) => setPassword(e.target.value)}
                     // autoComplete="current-password"
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={isChecked} onChange={setIsChecked} />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      Keep me logged in
                    </span>
                  </div>

                  <Link
                    to="/reset-password"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div>
                  <Button className="w-full" size="sm" disabled={loading}>
                    {loading ? "Signing in..." : "Sign in"}
                  </Button>
                </div>
              </div>
            </form>

            {/* <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Don&apos;t have an account?{" "}
                <Link
                  to="/signup"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Sign Up
                </Link>
              </p>
            </div> */}

            {/* Optional: helper note */}
            {/* <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              Token stored in {isChecked ? "localStorage" : "sessionStorage"} as{" "}
              <code>auth_token</code>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * OPTIONAL: Use this helper anywhere you fetch protected endpoints
 * Example:
 *   await authFetch("/api/me")
 */
export async function authFetch(path: string, init?: RequestInit) {
  const token =
    localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");

  return fetch(`http://localhost:8080${path}`, {
    ...(init || {}),
    headers: {
      ...(init?.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

