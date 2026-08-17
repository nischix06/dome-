"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import { getToken, logout } from "@/lib/auth";

export default function GovernmentPage() {
  const router = useRouter();
  const [testMessage, setTestMessage] = useState<string | null>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    fetch("/api/government/test", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (res.status === 401) {
          logout();
          router.push("/login");
          return;
        }
        if (res.status === 403) {
          router.push("/public");
          return;
        }

        const data = await res.json();
        if (!res.ok) {
          setTestError(data.message || "Failed to verify government access.");
        } else {
          setTestMessage(data.message || "Government access granted.");
        }
      })
      .catch(() => {
        setTestError("Unable to verify government access. Is the backend running?");
      })
      .finally(() => {
        setVerifying(false);
      });
  }, [router]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <AuthGuard requiredRole="government">
      {(user) => (
        <main style={{ padding: "2rem" }}>
          <h1>Government Panel</h1>
          <p>Welcome, {user.name} ({user.email})!</p>
          <p>Government panel — coming soon.</p>

          <div style={{ marginTop: "1.5rem", padding: "1rem", border: "1px solid #ccc", borderRadius: "8px" }}>
            <h3>Backend Verification Status:</h3>
            {verifying && <p>Verifying government access with backend...</p>}
            {testMessage && <p style={{ color: "green" }}>{testMessage}</p>}
            {testError && <p style={{ color: "red" }}>{testError}</p>}
          </div>

          <button
            onClick={handleLogout}
            style={{ marginTop: "1.5rem", padding: "0.5rem 1rem", cursor: "pointer" }}
          >
            Logout
          </button>
        </main>
      )}
    </AuthGuard>
  );
}
