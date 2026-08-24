"use client";

import AuthGuard from "@/components/AuthGuard";
import AuthenticatedHome from "@/components/dashboard/AuthenticatedHome";

export default function GovernmentPage() {
  return (
    <AuthGuard requiredRole="government">
      {(user) => <AuthenticatedHome user={user} />}
    </AuthGuard>
  );
}
