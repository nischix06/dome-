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
      {/* Left Pane (Muted Lavender) */}
      <div className={styles.leftPane}>
        <div className={styles.brand}>
          <Link href="/" className={styles.logoLink}>
            <span className={styles.logoBadge}>D</span>
            <span className={styles.logoText}>DOME</span>
          </Link>
        </div>

        <div className={styles.formContainer}>
          <h1 className={styles.heading}>LOGIN</h1>

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
              <label htmlFor="email-input" className={styles.iconLabel}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="20px"
                  viewBox="0 -960 960 960"
                  width="20px"
                  fill="#ffffff"
                >
                  <path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm320-280L160-640v400h640v-400L480-440Zm0-80 320-200H160l320 200ZM160-640v-80 480-400Z" />
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
                className={`${styles.input} ${inputClassName("email")}`}
              />
            </div>

            {/* Password */}
            <div className={styles.inputGroup}>
              <label htmlFor="password-input" className={styles.iconLabel}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="20px"
                  viewBox="0 -960 960 960"
                  width="20px"
                  fill="#ffffff"
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
                className={`${styles.input} ${inputClassName("password")}`}
              />
            </div>

            <button
              type="submit"
              id="login-button"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? "Logging in…" : "Login"}
            </button>
          </form>

          <p className={styles.switchText}>
            New here?{" "}
            <Link href="/signup" className={styles.switchLink}>
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Right Pane (Warm Cream / Editorial) */}
      <div className={styles.rightPane}>
        <div className={styles.decorContainer}>
          <div className={styles.decorBadge}>DOME</div>
          <p className={styles.decorCaption}>Civic Intelligence Platform</p>
        </div>
      </div>
    </div>
  );
}
