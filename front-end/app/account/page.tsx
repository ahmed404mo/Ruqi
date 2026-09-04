import PlateFormBeforeLogin from "@/components/account/auth-landing";
import GuestGuard from "@/components/account/auth/GuestGuard";

export default function AccountPage() {
  return (
    <GuestGuard>
      <PlateFormBeforeLogin />
    </GuestGuard>
  );
}
