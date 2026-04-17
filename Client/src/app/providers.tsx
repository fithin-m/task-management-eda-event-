"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "react-hot-toast";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GoogleOAuthProvider
      clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}
    >
      {children}

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#fff",
            color: "#111827",
            border: "1px solid #E5E7EB",
            borderRadius: "10px",
            fontSize: "14px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          },
        }}
      />
    </GoogleOAuthProvider>
  );
}