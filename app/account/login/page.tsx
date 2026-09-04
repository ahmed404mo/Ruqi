import AuthForm from "@/components/account/auth-form/auth-form";
import GuestGuard from "@/components/account/auth/GuestGuard";

export default function Login() {
  return (
    <GuestGuard>
      <AuthForm mode="login" />
    </GuestGuard>
  );
}
