// app/middleware/roleCheck.js
import { getSession } from "next-auth/react";

export const requireAdmin = async (context) => {
  const session = await getSession(context);
  
  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  if (session.user.role !== "admin") {
    return {
      redirect: {
        destination: '/dashboard',
        permanent: false,
      },
    };
  }

  return {
    props: { session }
  };
};

export const requireStudent = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  // Check if user has an associated student record
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/siswa`);
  const data = await response.json();
  const student = data.data.find(s => s._id === session.user.id);

  if (!student) {
    return {
      redirect: {
        destination: '/dashboard',
        permanent: false,
      },
    };
  }

  return {
    props: { session, student }
  };
};

export const requireAuth = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  return {
    props: { session }
  };
};

// Custom hook untuk cek izin client-side
export const useUserPermissions = (session) => {
  if (!session) return { isAdmin: false, isStudent: false };

  return {
    isAdmin: session.user.role === "admin",
    isStudent: session.user.role === "user",
    userId: session.user.id
  };
};