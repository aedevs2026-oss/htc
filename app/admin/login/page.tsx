import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin/login-form";

export default function AdminLoginPage() {
  return (
    <div className="admin-login-page">
      <Suspense>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
