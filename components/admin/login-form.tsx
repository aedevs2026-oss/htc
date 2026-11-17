"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AdminLoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    if (!supabase) {
      setError("Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      setLoading(false);
      return;
    }
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }
    router.push(params.get("next") || "/admin");
    router.refresh();
  }

  const missing = params.get("error") === "missing_supabase";

  return (
    <form className="admin-login-form" onSubmit={onSubmit}>
      <div className="admin-login-card">
        <p className="eyebrow">HTC Furniture</p>
        <h1>Admin sign in</h1>
        <p className="admin-login-copy">Sign in with your Supabase admin user to edit products, prices and categories.</p>
        {(missing || error) && <p className="admin-alert">{missing ? "Supabase environment variables are missing." : error}</p>}
        <label>
          Email
          <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Password
          <input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <button className="button button-dark admin-login-button" type="submit" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </div>
    </form>
  );
}
