"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getToken, getStoredUser, logout, StoredUser } from "@/lib/auth";

interface AuthGuardProps {
  children: ReactNode | ((user: StoredUser) => ReactNode);
  requiredRole?: "government" | "public";
}

export default function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    const currentUser = getStoredUser();

    if (!token || !currentUser) {
      logout();
      router.push("/login");
      return;
    }

    if (requiredRole && currentUser.role !== requiredRole) {
      if (currentUser.role === "government") {
        router.push("/government");
      } else {
        router.push("/public");
      }
      return;
    }

    setUser(currentUser);
    setLoading(false);
  }, [requiredRole, router]);

  if (loading || !user) {
    return <div>Checking authentication...</div>;
  }

  return <>{typeof children === "function" ? children(user) : children}</>;
}
