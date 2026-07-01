"use client";

import { Suspense } from "react";
import { AdminLoginForm } from "./login-form";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-100">加载中...</div>}>
      <AdminLoginForm />
    </Suspense>
  );
}
