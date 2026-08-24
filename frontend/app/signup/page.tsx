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
          "Cannot connect to the backend server. Please verify your backend is running."
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
          <h1 className={styles.heading}>SIGN UP</h1>

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
            {/* Name */}
            <div className={styles.inputGroup}>
              <label htmlFor="firstname-input" className={styles.iconLabel}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="20px"
                  viewBox="0 -960 960 960"
                  width="20px"
                  fill="#ffffff"
                >
                  <path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Zm80-80h480v-32q0-11-5.5-20T700-306q-54-27-109-40.5T480-360q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T560-640q0-33-23.5-56.5T480-720q-33 0-56.5 23.5T400-640q0 33 23.5 56.5T480-560Zm0 320Zm0-400Z" />
                </svg>
              </label>
              <input
                type="text"
                name="firstname"
                id="firstname-input"
                placeholder="Full Name"
                autoComplete="given-name"
                required
                aria-invalid={invalidFields.name || false}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`${styles.input} ${inputClassName("name")}`}
              />
            </div>

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
                autoComplete="new-password"
                required
                aria-invalid={invalidFields.password || false}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${styles.input} ${inputClassName("password")}`}
              />
            </div>

            {/* Confirm Password */}
            <div className={styles.inputGroup}>
              <label htmlFor="confirm-password-input" className={styles.iconLabel}>
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
                name="confirm-password"
                id="confirm-password-input"
                placeholder="Confirm Password"
                autoComplete="new-password"
                required
                aria-invalid={invalidFields.confirmPassword || false}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`${styles.input} ${inputClassName("confirmPassword")}`}
              />
            </div>

            <button
              type="submit"
              id="signup-button"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? "Creating account…" : "Sign up"}
            </button>
          </form>

          <p className={styles.switchText}>
            Already have an account?{" "}
            <Link href="/login" className={styles.switchLink}>
              Login
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
