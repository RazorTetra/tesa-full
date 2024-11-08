// app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectDB from "@/backend/config/database";
import User from "@/backend/models/user";
import Siswa from "@/backend/models/siswa";

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: {
          label: "Username",
          type: "text",
          placeholder: "Masukkan username Anda",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Masukkan password Anda",
        },
      },
      async authorize(credentials, req) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Username dan password harus diisi");
        }

        try {
          await connectDB();

          const user = await User.findOne({ username: credentials.username })
            .select("+password")
            .lean();

          if (!user) {
            throw new Error("User tidak ditemukan");
          }

          const isPasswordMatch = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordMatch) {
            throw new Error("Password salah");
          }

          let siswaData = null;
          if (user.pengguna === "user") {
            siswaData = await Siswa.findOne({ userId: user._id }).lean();
          }

          delete user.password;

          return {
            id: siswaData ? siswaData._id : user._id,
            name: user.nama,
            email: user.email,
            role: user.pengguna,
            image: user.image,
            userId: user._id,
          };
        } catch (error) {
          console.error("Auth Error:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
    signOut: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.userId = user.userId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role;
        session.user.id = token.id;
        session.user.userId = token.userId;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };