// app/auth/login/page.tsx
import { Suspense } from "react";
import AuthPage from "./AuthPage"; // your existing file

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <AuthPage />
    </Suspense>
  );
}