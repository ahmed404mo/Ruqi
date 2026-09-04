"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Settings, KeyRound, User, LogOut } from "lucide-react";
import {
  getProfile,
  logoutUser,
  updateStudentProfile,
  UserProfile,
  getEducationalStages,
  EducationalStage,
} from "@/lib/api";
import Loading from "@/app/loading";
import EditProfileModal from "@/components/account/profile/Edit/edit-profile-modal";
import ChangePasswordModal from "@/components/account/profile/Edit/change-password-modal";
import LogoutConfirmModal from "@/components/account/profile/Edit/logout-confirm-modal";
import AdminDashboard from "@/components/eductational-content/teacher/teacher-dashboard";

export default function StudentProfile() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stages, setStages] = useState<EducationalStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    phoneNumber: "",
    address: "",
    stage: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    password: "",
    confirmPassword: "",
  });
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logoutUser();
    router.replace("/account");
    router.refresh();
  };

  const openEditModal = () => {
    const currentStage = profile?.stage ?? "";
    const matched = stages.some((s) => s._id === currentStage);
    setEditForm({
      name: profile?.name ?? "",
      phoneNumber: profile?.phoneNumber ?? "",
      address: profile?.address ?? "",
      stage: matched ? currentStage : "",
    });
    setEditError(null);
    setShowEditModal(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name: field, value } = e.target;
    setEditForm((prev) => ({ ...prev, [field]: value }));
    if (editError) setEditError(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);

    const phone = editForm.phoneNumber.trim();
    if (phone && !/^01[0-9]{9}$/.test(phone)) {
      setEditError("يرجى إدخال رقم هاتف مصري صحيح (مثال: 01012345678)");
      return;
    }

    setSavingEdit(true);

    try {
      await updateStudentProfile({
        name: editForm.name,
        phoneNumber: editForm.phoneNumber,
        address: editForm.address,
        stage: editForm.stage,
      });
      const fresh = await getProfile();
      setProfile(fresh);
      setShowEditModal(false);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "تعذر حفظ البيانات");
    } finally {
      setSavingEdit(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name: field, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
    if (passwordError) setPasswordError(null);
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.password !== passwordForm.confirmPassword) {
      setPasswordError("كلمتا المرور غير متطابقتين");
      return;
    }
    if (passwordForm.password.length < 6) {
      setPasswordError("كلمة المرور يجب ألا تقل عن 6 أحرف");
      return;
    }

    setSavingPassword(true);
    setPasswordError(null);

    try {
      const updated = await updateStudentProfile({ password: passwordForm.password });
      setProfile(updated);
      setPasswordForm({ password: "", confirmPassword: "" });
      setShowPasswordModal(false);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "تعذر تغيير كلمة المرور");
    } finally {
      setSavingPassword(false);
    }
  };

  useEffect(() => {
    let active = true;

    Promise.all([getProfile(), getEducationalStages().catch(() => [])])
      .then(([profileData, stagesData]) => {
        if (!active) return;
        setProfile(profileData);
        setStages(stagesData);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "تعذر تحميل بيانات الحساب");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <Loading />;
  }

  if (error || !profile) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-5 px-4 font-cairo text-center"
        dir="rtl"
      >
        <span className="text-danger font-bold text-[16px] max-w-[300px] leading-relaxed">
          {error ?? "تعذر تحميل بيانات الحساب"}
        </span>
        <button
          type="button"
          onClick={() => router.push("/account/login")}
          className="h-[48px] px-8 bg-primary rounded-xl text-text-main font-bold text-[15px] hover:bg-primary-hover transition-colors shadow-sm"
        >
          تسجيل الدخول
        </button>
      </div>
    );
  }

  const { name, studentId, email, phoneNumber, stage, role } = profile;
  const stageTitle = stages.find((s) => s._id === stage)?.title || stage;

  return (
    <div
      className="min-h-screen bg-background pt-24 pb-12 px-4 sm:px-6 md:px-8 lg:px-[120px] font-cairo flex flex-col gap-8 lg:gap-12 items-center overflow-x-hidden"
      dir="rtl"
    >
      <div className="w-full max-w-[1200px] bg-white rounded-[20px] md:rounded-[24px] border border-border shadow-[0_8px_24px_-2px_rgba(84,70,58,0.05)] p-5 sm:p-6 md:p-10 flex flex-col gap-6 md:gap-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 w-full lg:w-auto text-center sm:text-right">
            <div className="w-[80px] h-[80px] md:w-[112px] md:h-[112px] rounded-full border-2 border-primary bg-primary-light flex items-center justify-center shrink-0">
              <User size={36} className="text-primary md:w-[48px] md:h-[48px]" />
            </div>
            <div className="flex flex-col gap-2 sm:gap-3 mt-1 sm:mt-2">
              <h1 className="text-[20px] sm:text-[22px] md:text-[26px] font-extrabold text-text-main leading-tight">
                {name}
              </h1>
              <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 sm:gap-3">
                {studentId && (
                  <span className="bg-primary-light text-primary text-[11px] sm:text-[12px] font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    {studentId}
                  </span>
                )}
                <span className="text-[13px] sm:text-[14px] md:text-[15px] text-text-muted leading-relaxed max-w-[280px] sm:max-w-none">
                  {role === "STUDENT"
                    ? "طالب أكاديمي في رُقِيّ"
                    : role === "TEACHER"
                      ? "الهيئة الأكاديمية ل رُقِيّ"
                      : role === "ADMIN"
                        ? "مسؤول النظام (Admin)"
                        : "عضو في رُقِيّ"}
                  {role === "STUDENT" && stageTitle ? ` • ${stageTitle}` : ""}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:flex lg:flex-row items-stretch gap-3 w-full lg:w-auto shrink-0">
            {role === "STUDENT" && (
              <>
                <button
                  type="button"
                  onClick={openEditModal}
                  className="h-[48px] md:h-[50px] px-4 md:px-6 bg-primary text-text-main font-bold text-[13px] md:text-[14px] rounded-xl shadow-[0_12px_32px_-4px_rgba(196,154,69,0.1)] hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <Settings size={18} />
                  تعديل المعلومات
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPasswordForm({ password: "", confirmPassword: "" });
                    setPasswordError(null);
                    setShowPasswordModal(true);
                  }}
                  className="h-[48px] md:h-[50px] px-4 md:px-6 bg-transparent border border-border text-text-muted font-bold text-[13px] md:text-[14px] rounded-xl hover:bg-surface-secondary transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <KeyRound size={18} />
                  كلمة المرور
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              className="h-[48px] md:h-[50px] px-4 md:px-6 bg-transparent border border-border text-danger font-bold text-[13px] md:text-[14px] rounded-xl hover:bg-danger-bg transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <LogOut size={18} />
              تسجيل الخروج
            </button>
          </div>
        </div>

        <div className="w-full h-px bg-border"></div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          <div className="flex flex-col gap-1 p-3 sm:p-0 bg-surface-secondary sm:bg-transparent rounded-lg sm:rounded-none">
            <span className="text-[12px] md:text-[13px] text-text-muted">البريد الإلكتروني</span>
            <span className="text-[14px] md:text-[16px] font-bold text-text-main break-all" dir="ltr">
              {email}
            </span>
          </div>
          <div className="flex flex-col gap-1 p-3 sm:p-0 bg-surface-secondary sm:bg-transparent rounded-lg sm:rounded-none">
            <span className="text-[12px] md:text-[13px] text-text-muted">رقم الهاتف</span>
            <span className="text-[14px] md:text-[16px] font-bold text-text-main" dir="ltr">
              {phoneNumber || "—"}
            </span>
          </div>
          {role === "STUDENT" && (
            <div className="flex flex-col gap-1 p-3 sm:p-0 bg-surface-secondary sm:bg-transparent rounded-lg sm:rounded-none sm:col-span-2 lg:col-span-1">
              <span className="text-[12px] md:text-[13px] text-text-muted">المرحلة الدراسية</span>
              <span className="text-[14px] md:text-[16px] font-bold text-text-main break-words">
                {stageTitle || "—"}
              </span>
            </div>
          )}
        </div>
      </div>

      {role === "TEACHER" && <AdminDashboard />}

      <LogoutConfirmModal
        open={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        loggingOut={loggingOut}
      />

      <EditProfileModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        form={editForm}
        onChange={handleEditChange}
        onSubmit={handleSaveEdit}
        saving={savingEdit}
        error={editError}
        stages={stages} // تمرير المراحل للنافذة
      />

      <ChangePasswordModal
        open={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        form={passwordForm}
        onChange={handlePasswordChange}
        onSubmit={handleSavePassword}
        saving={savingPassword}
        error={passwordError}
      />
    </div>
  );
}
