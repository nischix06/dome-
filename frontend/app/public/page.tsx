"use client";

import AuthGuard from "@/components/AuthGuard";
import AuthenticatedHome from "@/components/dashboard/AuthenticatedHome";

export default function PublicPage() {
  return (
    <AuthGuard requiredRole="public">
      {(user) => <AuthenticatedHome user={user} />}
    </AuthGuard>
  );
}
