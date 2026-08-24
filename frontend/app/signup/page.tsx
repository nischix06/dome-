"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./signup.module.css";

interface RegisterResponse {
  message: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [invalidFields, setInvalidFields] = useState<Record<string, boolean>>(
    {}
  );

  function validate(): string | null {
    const fields: Record<string, boolean> = {};

    if (!name.trim()) {
      fields.name = true;
      setInvalidFields(fields);
      return "Name is required.";
    }
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
    if (!confirmPassword) {
      fields.confirmPassword = true;
      setInvalidFields(fields);
      return "Please confirm your password.";
    }
    if (password !== confirmPassword) {
      fields.password = true;
      fields.confirmPassword = true;
      setInvalidFields(fields);
      return "Passwords do not match.";
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
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      });

      let data: RegisterResponse;
      try {
        data = await res.json();
      } catch {
        throw new Error(
          "Cannot connect to the backend server. Please verify your backend is running and BACKEND_URL is configured on Netlify."
        );
      }

      if (!res.ok) {
        setError(data.message || "Registration failed. Please try again.");
        return;
      }

      setSuccess(data.message || "Account created successfully!");
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setInvalidFields({});

      setTimeout(() => {
        router.push("/login");
      }, 1000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to create your account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  const inputClassName = (field: string) =>
    invalidFields[field]
      ? `${styles.incorrect}`
      : "";

  return (
    <div className={styles.page}>
      <div className={styles.wrapper}>
        <h1>Sign up</h1>

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

        <form className={styles.form} id="form" onSubmit={handleSubmit} noValidate>
          {/* Name */}
          <div className={styles.inputGroup}>
            <label htmlFor="firstname-input">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#714216"
              >
                <path d="M367-527q-47-47-47-113t47-113q47-47 113-47t113 47q47 47 47 113t-47 113q-47 47-113 47t-113-47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Zm80-80h480v-32q0-11-5.5-20T700-306q-54-27-109-40.5T480-360q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32Zm296.5-343.5Q560-607 560-640t-23.5-56.5Q513-720 480-720t-56.5 23.5Q400-673 400-640t23.5 56.5Q447-560 480-560t56.5-23.5ZM480-640Zm0 400Z" />
              </svg>
            </label>
            <input
              type="text"
              name="firstname"
              id="firstname-input"
              placeholder="firstname"
              autoComplete="given-name"
              required
              aria-invalid={invalidFields.name || false}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClassName("name")}
            />
          </div>

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
              autoComplete="new-password"
              required
              aria-invalid={invalidFields.password || false}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClassName("password")}
            />
          </div>

          {/* Confirm Password */}
          <div className={styles.inputGroup}>
            <label htmlFor="confirm-password-input">
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
              name="confirm-password"
              id="confirm-password-input"
              placeholder="Confirm Password"
              autoComplete="new-password"
              required
              aria-invalid={invalidFields.confirmPassword || false}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClassName("confirmPassword")}
            />
          </div>

          <button
            type="submit"
            id="signup-button"
            disabled={loading}
          >
            {loading ? "Creating account…" : "Sign up"}
          </button>
        </form>

        <p>
          Already have an account? <Link href="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
