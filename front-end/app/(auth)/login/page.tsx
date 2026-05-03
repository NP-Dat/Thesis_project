"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Spinner } from "@/components/ui/Spinner";
import { Activity } from "lucide-react";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setError(null);
    try {
      const user = await login(data.email, data.password);
      router.push(user.role === "admin" ? "/admin/dashboard" : "/dashboard");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Login failed. Please try again.";
      setError(message);
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:flex-1 items-center justify-center bg-parchment p-12">
        <div className="max-w-md text-center">
          <div className="flex items-center justify-center mb-8">
            <div className="w-16 h-16 rounded-full bg-terracotta/10 flex items-center justify-center">
              <Activity size={32} className="text-terracotta" />
            </div>
          </div>
          <h1 className="font-serif text-4xl font-medium leading-[1.10] text-near-black mb-4">
            Employee Burnout Detection
          </h1>
          <p className="text-olive text-lg leading-relaxed">
            Monitor and predict workforce mental health with AI-powered
            assessments. Early detection for a healthier workplace.
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-ivory p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <Activity size={24} className="text-terracotta" />
            <span className="font-serif text-lg font-medium">Burnout Detection</span>
          </div>

          <h2 className="font-serif text-2xl font-medium text-near-black mb-1">
            Welcome back
          </h2>
          <p className="text-sm text-olive mb-6">
            Sign in to access your dashboard.
          </p>

          {error && (
            <div className="mb-4 rounded-[var(--radius-card)] bg-crimson/10 border border-crimson/20 px-4 py-3 text-sm text-crimson">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@factory.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-crimson mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-crimson mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? <Spinner className="h-4 w-4" /> : "Sign In"}
            </Button>
          </form>

          <p className="text-sm text-olive text-center mt-6">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-terracotta font-medium hover:underline"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
