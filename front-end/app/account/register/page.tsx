import AuthForm from "@/components/account/auth-form/auth-form";
import GuestGuard from "@/components/account/auth/GuestGuard";

export default function Register() {
  return (
    <GuestGuard>
      <AuthForm mode="register" />
    </GuestGuard>
  );
}
