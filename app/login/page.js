// app/login/page.js
"use client";
import React, { useState } from "react";
import { Eye, EyeOff, User, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import styles from "../ui/login/login.module.css";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        username: formData.username,
        password: formData.password,
        redirect: false,
      });

      if (result.error) {
        setError("Username atau password salah");
      } else {
        router.replace("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container} suppressHydrationWarning={true}>
      <div className={styles.backgroundAnimation}>
        <div className={styles.backgroundText}>SMP ADVENT TOMPASO</div>
      </div>
      <div className={styles.loginBox}>
        <div className={styles.logoContainer}>
          <h1 className={styles.title}>SMP ADVENT TOMPASO</h1>
        </div>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <User className={styles.inputIcon} size={20} />
            <input
              type="text"
              name="username"
              placeholder="Username"
              className={styles.input}
              value={formData.username}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>
          <div className={styles.inputGroup}>
            <Lock className={styles.inputIcon} size={20} />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              className={styles.input}
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
            <button
              type="button"
              className={styles.togglePassword}
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <button 
            type="submit" 
            className={styles.loginButton}
            disabled={isLoading}
          >
            <span>{isLoading ? "Loading..." : "Login"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}