"use client";

import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import { logout } from "@/lib/auth";

export default function PublicPage() {
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <AuthGuard requiredRole="public">
      {(user) => (
        <main style={{ padding: "2rem" }}>
          <h1>Public Panel</h1>
          <p>Welcome, {user.name} ({user.email})!</p>
          <p>Public panel — coming soon.</p>
          <button
            onClick={handleLogout}
            style={{ marginTop: "1rem", padding: "0.5rem 1rem", cursor: "pointer" }}
          >
            Logout
          </button>
        </main>
      )}
    </AuthGuard>
  );
}
