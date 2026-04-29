"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { login, register } from "@/lib/api/auth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

type Tab = "login" | "register";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();

  const [tab, setTab] = useState<Tab>("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Register form extras
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regGender, setRegGender] = useState("Male");
  const [regAge, setRegAge] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password);
      setUser(user);
      router.push(user.role === "admin" ? "/admin/dashboard" : "/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await register({
        email: regEmail,
        password: regPassword,
        name: regName,
        gender: regGender,
        age: parseInt(regAge, 10),
      });
      setUser(user);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-near-black items-center justify-center p-12">
        <div className="max-w-md">
          <h1 className="font-serif font-medium text-4xl text-ivory leading-tight mb-6">
            Industrial Employee Burnout Detection
          </h1>
          <p className="text-warm-silver text-lg leading-relaxed">
            AI-powered wellness monitoring that combines psychological
            assessment with machine learning to predict and prevent workplace
            burnout before it happens.
          </p>
          <div className="mt-10 flex gap-8 text-stone-gray text-sm">
            <div>
              <p className="text-2xl font-serif font-medium text-coral">13</p>
              <p>CBI Questions</p>
            </div>
            <div>
              <p className="text-2xl font-serif font-medium text-coral">AI</p>
              <p>Burn Rate Prediction</p>
            </div>
            <div>
              <p className="text-2xl font-serif font-medium text-coral">24/7</p>
              <p>Monitoring</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-parchment">
        <div className="w-full max-w-md">
          <h2 className="font-serif font-medium text-2xl text-near-black mb-8">
            {tab === "login" ? "Welcome back" : "Create an account"}
          </h2>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-warm-sand/60 rounded-lg p-1">
            <button
              onClick={() => { setTab("login"); setError(""); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                tab === "login"
                  ? "bg-white text-near-black shadow-sm"
                  : "text-olive-gray hover:text-near-black"
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => { setTab("register"); setError(""); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                tab === "register"
                  ? "bg-white text-near-black shadow-sm"
                  : "text-olive-gray hover:text-near-black"
              }`}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-error/10 text-error text-sm">
              {error}
            </div>
          )}

          {tab === "login" ? (
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <Input
                id="email"
                label="Email"
                type="email"
                placeholder="employee@test.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                id="password"
                label="Password"
                type="password"
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button type="submit" variant="brand" disabled={loading} className="mt-2 w-full">
                {loading ? "Signing in..." : "Sign In"}
              </Button>
              <p className="text-xs text-stone-gray text-center mt-2">
                Test accounts: employee@test.com / admin@test.com (password: password)
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              <Input
                id="reg-name"
                label="Full Name"
                placeholder="Your full name"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                required
              />
              <Input
                id="reg-email"
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required
              />
              <Input
                id="reg-password"
                label="Password"
                type="password"
                placeholder="Choose a password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="reg-gender" className="text-sm font-medium text-olive-gray">
                    Gender
                  </label>
                  <select
                    id="reg-gender"
                    value={regGender}
                    onChange={(e) => setRegGender(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border-warm bg-white text-near-black focus:outline-none focus:border-focus-blue focus:ring-2 focus:ring-focus-blue/25 transition-colors"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <Input
                  id="reg-age"
                  label="Age"
                  type="number"
                  placeholder="25"
                  min={18}
                  max={70}
                  value={regAge}
                  onChange={(e) => setRegAge(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" variant="brand" disabled={loading} className="mt-2 w-full">
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
