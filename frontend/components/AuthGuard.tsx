"use client";

import { useSyncExternalStore, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { logout, StoredUser } from "@/lib/auth";

interface AuthGuardProps {
  children: ReactNode | ((user: StoredUser) => ReactNode);
  requiredRole?: "government" | "public";
}

// ─────────────────────────────────────────────────────────────────────────────
// Cached auth snapshot store
//
// useSyncExternalStore requires getSnapshot to return the SAME reference
// unless the data has actually changed. JSON.parse() returns a fresh object
// every call, so we cache by comparing the raw localStorage string.
// ─────────────────────────────────────────────────────────────────────────────

let cachedSnapshot: StoredUser | null = null;
let cachedRawToken: string | null = null;
let cachedRawUser: string | null = null;

function computeSnapshot(): StoredUser | null {
  if (typeof window === "undefined") return null;

  const rawToken = localStorage.getItem("token");
  const rawUser = localStorage.getItem("user");

  // Return the exact same object reference if the raw strings haven't changed
  if (rawToken === cachedRawToken && rawUser === cachedRawUser) {
    return cachedSnapshot;
  }

  // Raw values changed — update the cache
  cachedRawToken = rawToken;
  cachedRawUser = rawUser;

  if (!rawToken || !rawUser) {
    cachedSnapshot = null;
    return null;
  }

  try {
    cachedSnapshot = JSON.parse(rawUser) as StoredUser;
  } catch {
    cachedSnapshot = null;
  }

  return cachedSnapshot;
}

function getAuthSnapshot(): StoredUser | null {
  return computeSnapshot();
}

const SERVER_SNAPSHOT: StoredUser | null = null;

function getServerSnapshot(): StoredUser | null {
  return SERVER_SNAPSHOT;
}

const listeners = new Set<() => void>();

function subscribeAuth(callback: () => void): () => void {
  listeners.add(callback);

  // Listen for cross-tab storage changes
  const onStorage = (e: StorageEvent) => {
    if (e.key === "token" || e.key === "user" || e.key === null) {
      callback();
    }
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", onStorage);
  };
}

/**
 * Call this after login/logout to notify all AuthGuard instances
 * within the same tab that auth state has changed.
 */
export function notifyAuthChange(): void {
  listeners.forEach((cb) => cb());
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const router = useRouter();
  const currentUser = useSyncExternalStore(
    subscribeAuth,
    getAuthSnapshot,
    getServerSnapshot
  );

  // Handle redirects as a side-effect, not during render
  useEffect(() => {
    if (!currentUser) {
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
    }
  }, [currentUser, requiredRole, router]);

  // Render loading state while unauthenticated or role-mismatched
  if (!currentUser) {
    return <div>Checking authentication...</div>;
  }

  if (requiredRole && currentUser.role !== requiredRole) {
    return <div>Checking authentication...</div>;
  }

  return <>{typeof children === "function" ? children(currentUser) : children}</>;
}
