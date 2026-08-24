"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { setToken, setStoredUser, type StoredUser } from "@/lib/auth";
import styles from "./login.module.css";

interface LoginResponse {
  message: string;
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: "government" | "public";
  };
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [invalidFields, setInvalidFields] = useState<Record<string, boolean>>(
    {}
  );

  function validate(): string | null {
    const fields: Record<string, boolean> = {};

    if (!email.trim()) {
      fields.email = true;
      setInvalidFields(fields);
      return "Email is required.";
    }
    if (!isValidEmail(email.trim())) {
      fields.email = true;
      setInvalidFields(fields);
      return "Please enter a valid email address.";
    }
    if (!password) {
      fields.password = true;
      setInvalidFields(fields);
      return "Password is required.";
    }

    setInvalidFields({});
    return null;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) return;

    setError("");
    setSuccess("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      let data: LoginResponse;
      try {
        data = await res.json();
      } catch {
        throw new Error("Something went wrong. Please try again.");
      }

      if (!res.ok) {
        setError(data.message || "Invalid email or password.");
        return;
      }

      // Store authentication data
      if (data.token) {
        setToken(data.token);
      }

      if (data.user) {
        const user: StoredUser = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
        };
        setStoredUser(user);
      }

      setSuccess(data.message || "Login successful!");

      // Role-based redirect
      const role = data.user?.role;
      const destination = role === "government" ? "/government" : "/public";

      setTimeout(() => {
        router.push(destination);
      }, 800);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to connect to the server.");
      }
    } finally {
      setLoading(false);
    }
  }

  const inputClassName = (field: string) =>
    invalidFields[field] ? `${styles.incorrect}` : "";

  return (
    <div className={styles.page}>
      <div className={styles.wrapper}>
        <h1>Login</h1>

        {error && (
          <p
            className={styles.errorMessage}
            id="error-message"
            role="alert"
            aria-live="assertive"
          >
            {error}
          </p>
        )}

        {success && (
          <p
            className={styles.successMessage}
            role="status"
            aria-live="polite"
          >
            {success}
          </p>
        )}

        <form
          className={styles.form}
          id="form"
          onSubmit={handleSubmit}
          noValidate
        >
          {/* Email */}
          <div className={styles.inputGroup}>
            <label htmlFor="email-input">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#714216"
              >
                <path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480v58q0 59-40.5 100.5T740-280q-35 0-66-15t-52-43q-29 29-65.5 43.5T480-280q-83 0-141.5-58.5T280-480q0-83 58.5-141.5T480-680q83 0 141.5 58.5T680-480v58q0 26 17 44t43 18q26 0 43-18t17-44v-58q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93h200v80H480Zm85-315q35-35 35-85t-35-85q-35-35-85-35t-85 35q-35 35-35 85t35 85q35 35 85 35t85-35Z" />
              </svg>
            </label>
            <input
              type="email"
              name="email"
              id="email-input"
              placeholder="Email"
              autoComplete="email"
              required
              aria-invalid={invalidFields.email || false}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClassName("email")}
            />
          </div>

          {/* Password */}
          <div className={styles.inputGroup}>
            <label htmlFor="password-input">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#714216"
              >
                <path d="M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm0-80h480v-400H240v400Zm296.5-143.5Q560-327 560-360t-23.5-56.5Q513-440 480-440t-56.5 23.5Q400-393 400-360t23.5 56.5Q447-280 480-280t56.5-23.5ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80ZM240-160v-400 400Z" />
              </svg>
            </label>
            <input
              type="password"
              name="password"
              id="password-input"
              placeholder="Password"
              autoComplete="current-password"
              required
              aria-invalid={invalidFields.password || false}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClassName("password")}
            />
          </div>

          <button type="submit" id="login-button" disabled={loading}>
            {loading ? "Logging in…" : "Login"}
          </button>
        </form>

        <p>
          New here? <Link href="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
