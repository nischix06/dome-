import Link from "next/link";

export default function Home() {
  return (
    <main>
      <h1>Welcome to Dome</h1>
      <p>Get started by signing up or logging in.</p>
      <nav>
        <Link href="/signup">Sign Up</Link>
        <Link href="/login">Login</Link>
      </nav>
    </main>
  );
}
