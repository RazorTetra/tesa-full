// app/hooks/useRole.js
"use client";
import { useSession } from "next-auth/react";

export const useRole = () => {
  const { data: session } = useSession();
  
  return {
    isAdmin: session?.user?.role === "admin",
    isUser: session?.user?.role === "user",
    role: session?.user?.role,
  };
};