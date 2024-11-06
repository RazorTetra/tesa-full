// app/components/RoleBasedAccess.js
"use client";
import { useSession } from "next-auth/react";

export const RoleBasedAccess = ({ children, allowedRoles }) => {
  const { data: session } = useSession();

  if (!session || !allowedRoles.includes(session.user.role)) {
    return null;
  }

  return children;
};