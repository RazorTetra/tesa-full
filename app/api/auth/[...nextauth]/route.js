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
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          await connectDB();
          
          // Tambahkan log untuk debug
          console.log("Attempting login with:", {
            username: credentials.username,
            passwordLength: credentials.password?.length
          });
          
          const user = await User.findOne({ username: credentials.username });
          
          if (!user) {
            console.log("User not found:", credentials.username);
            throw new Error("User tidak ditemukan");
          }

          // Log untuk memastikan password yang diinput dan hash di DB
          console.log("Comparing passwords:", {
            inputPassword: credentials.password,
            storedHash: user.password
          });
          
          const isPasswordMatch = await bcrypt.compare(
            credentials.password.toString(), // Pastikan password dalam bentuk string
            user.password
          );
          
          if (!isPasswordMatch) {
            console.log("Password mismatch for user:", credentials.username);
            throw new Error("Password salah");
          }

          // If user is a regular user (siswa), get the siswa data
          let siswaData = null;
          if (user.pengguna === "user") {
            siswaData = await Siswa.findOne({ userId: user._id });
            if (!siswaData) {
              console.log("Siswa data not found for user:", user._id);
              // Ubah ini agar tidak menghentikan login jika data siswa tidak ditemukan
              console.warn("Data siswa tidak ditemukan untuk user:", user._id);
            }
          }

          // Return user data for session
          const userData = {
            id: siswaData ? siswaData._id : user._id,
            name: user.nama,
            email: user.email,
            role: user.pengguna,
            image: user.image,
            userId: user._id
          };

          console.log("Login successful, returning user data:", userData);
          return userData;

        } catch (error) {
          console.error("Auth error:", error);
          throw new Error(error.message);
        }
      }
    })
  ],
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
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // Tambahkan ini untuk debugging
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };