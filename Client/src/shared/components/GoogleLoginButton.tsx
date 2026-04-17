"use client";

import { useAuthStore } from "@/store/authStore";
import { GoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";

export default function GoogleLoginButton() {
    const { setAuth } = useAuthStore();

    const handleSuccess = async (credentialResponse: any) => {
        try {
            const res = await fetch("http://localhost:5000/auth/google", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    token: credentialResponse.credential,
                }),
            });

            const data = await res.json();

            setAuth(data.user, data.token)

            toast.success("Login successful");

            setTimeout(() => {
                window.location.href = "/dashboard";
            }, 500);

        } catch (error) {
            toast.error("Google login failed");
        }
    };

    return (
        <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => toast.error("Login Failed")}
             width="320"
        />
    );
}