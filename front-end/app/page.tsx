"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Spinner } from "@/components/ui/Spinner";

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    router.replace(user.role === "admin" ? "/admin/dashboard" : "/dashboard");
  }, [user, isLoading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-parchment">
      <Spinner className="h-8 w-8" />
    </div>
  );
}
