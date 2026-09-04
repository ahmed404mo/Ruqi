export const API_BASE_URL = "/api/backend";

// --- 1. Educational Content (Stages / Months / Lessons & Exams) ---

// ============= Types =============
export interface EducationalStage {
  _id: string;
  title: string;
  image?: string | null;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Month {
  _id: string;
  title: string;
  description: string;
  image?: string | null;
  price: number;
  stage: string;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContentQuestion {
  questionText: string;
  options: string[];
  correctAnswers: number[];
}

export type ContentType = "LESSON" | "EXAM";

export interface LessonExam {
  _id: string;
  type: ContentType;
  title: string;
  description: string;
  image?: string | null;
  month: string;
  order: number;
  videoUrl?: string;
  writtenExplanation?: string;
  homework?: ContentQuestion[];
  examQuestions?: ContentQuestion[];
  passPercentage?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReorderItem {
  id: string;
  order: number;
}

export interface StagePayload {
  title: string;
  image?: string;
  order?: number;
}

export interface MonthPayload {
  title: string;
  description: string;
  image?: string;
  price?: number;
  stage?: string;
  order?: number;
}

export interface LessonPayload {
  title: string;
  description: string;
  month: string;
  type: ContentType;
  videoUrl?: string;
  writtenExplanation?: string;
  homework?: ContentQuestion[];
  order?: number;
}

export interface ExamPayload {
  title: string;
  description: string;
  month: string;
  type: ContentType;
  examQuestions?: ContentQuestion[];
  passPercentage?: number;
  order?: number;
}

export interface ContentPayload {
  title?: string;
  description?: string;
  videoUrl?: string;
  writtenExplanation?: string;
  homework?: ContentQuestion[];
  examQuestions?: ContentQuestion[];
  passPercentage?: number;
  order?: number;
  image?: string;
}

// ============= Helper: authed POST/PATCH/DELETE for TEACHER endpoints =============
async function authedJson(url: string, method: string, body?: unknown): Promise<any> {
  const payload = body !== undefined ? { body: JSON.stringify(body) } : {};
  const res = await authedFetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    ...payload,
  });
  const data = await safeJson(res);
  if (!res.ok) {
    if (res.status === 401) clearTokens();
    throw new Error(formatApiError(data));
  }
  return data;
}

// ============= STAGES =============
export async function getEducationalStages(): Promise<EducationalStage[]> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/educational-content/stages`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    throw new Error("تعذر الاتصال بالخادم");
  }

  const data = await safeJson(res);
  if (!res.ok) {
    throw new Error(formatApiError(data));
  }
  return data as EducationalStage[];
}

export async function createStage(payload: StagePayload): Promise<EducationalStage> {
  return authedJson(`${API_BASE_URL}/educational-content/stages`, "POST", payload);
}

export async function updateStage(id: string, payload: StagePayload): Promise<EducationalStage> {
  return authedJson(`${API_BASE_URL}/educational-content/stages/${id}`, "PATCH", payload);
}

export async function deleteStage(id: string): Promise<{ message: string }> {
  return authedJson(`${API_BASE_URL}/educational-content/stages/${id}`, "DELETE");
}

export async function reorderStages(items: ReorderItem[]): Promise<{ message: string }> {
  return authedJson(`${API_BASE_URL}/educational-content/stages/reorder`, "PATCH", { items });
}

// ============= MONTHS =============
export async function getMonthsByStage(stageId: string): Promise<Month[]> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/educational-content/months/stage/${stageId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    throw new Error("تعذر الاتصال بالخادم");
  }

  const data = await safeJson(res);
  if (!res.ok) {
    throw new Error(formatApiError(data));
  }
  return data as Month[];
}

export async function createMonth(payload: MonthPayload): Promise<Month> {
  return authedJson(`${API_BASE_URL}/educational-content/months`, "POST", payload);
}

export async function updateMonth(id: string, payload: MonthPayload): Promise<Month> {
  return authedJson(`${API_BASE_URL}/educational-content/months/${id}`, "PATCH", payload);
}

export async function deleteMonth(id: string): Promise<{ message: string }> {
  return authedJson(`${API_BASE_URL}/educational-content/months/${id}`, "DELETE");
}

export async function reorderMonths(items: ReorderItem[]): Promise<{ message: string }> {
  return authedJson(`${API_BASE_URL}/educational-content/months/reorder`, "PATCH", { items });
}

// ============= LESSONS & EXAMS (CONTENT) =============
export async function getContentByMonth(monthId: string): Promise<LessonExam[]> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/educational-content/content/month/${monthId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    throw new Error("تعذر الاتصال بالخادم");
  }

  const data = await safeJson(res);
  if (!res.ok) {
    throw new Error(formatApiError(data));
  }
  return data as LessonExam[];
}

export async function createLesson(payload: LessonPayload): Promise<LessonExam> {
  return authedJson(`${API_BASE_URL}/educational-content/lessons`, "POST", payload);
}

export async function createExam(payload: ExamPayload): Promise<LessonExam> {
  return authedJson(`${API_BASE_URL}/educational-content/exams`, "POST", payload);
}

export async function updateContent(id: string, payload: ContentPayload): Promise<LessonExam> {
  return authedJson(`${API_BASE_URL}/educational-content/content/${id}`, "PATCH", payload);
}

export async function deleteContent(id: string): Promise<{ message: string }> {
  return authedJson(`${API_BASE_URL}/educational-content/content/${id}`, "DELETE");
}

export async function reorderContent(items: ReorderItem[]): Promise<{ message: string }> {
  return authedJson(`${API_BASE_URL}/educational-content/content/reorder`, "PATCH", { items });
}


// --- 2. Authentication ---
export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  address: string;
  stage: string; 
}

export interface SignupResult {
  message: string;
  email: string;
}

export async function signup(payload: SignupPayload): Promise<SignupResult> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error("تعذر الاتصال بالخادم");
  }

  const data = await safeJson(res);
  if (!res.ok) {
    throw new Error(formatApiError(data));
  }
  return data as SignupResult;
}


export interface VerifyAccountPayload {
  email: string;
  otp: string;
}

export async function verifyAccount(payload: VerifyAccountPayload): Promise<void> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/auth/verify-account`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error("تعذر الاتصال بالخادم");
  }

  const data = await safeJson(res);
  if (!res.ok) {
    throw new Error(formatApiError(data));
  }
}


export async function resendOtp(email: string): Promise<void> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
  } catch {
    throw new Error("تعذر الاتصال بالخادم");
  }

  const data = await safeJson(res);
  if (!res.ok) {
    throw new Error(formatApiError(data));
  }
}


export class NotVerifiedError extends Error {
  constructor() {
    super("الحساب غير مفعل، يرجى تفعيل الحساب أولاً بواسطة رمز التحقق");
    this.name = "NotVerifiedError";
  }
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResult {
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    studentId: string | null;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export async function loginUser(payload: LoginPayload): Promise<LoginResult> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error("تعذر الاتصال بالخادم");
  }

  const data = await safeJson(res);

  if (!res.ok) {
    if (res.status === 403 || data.message?.includes("تفعيل")) {
      throw new NotVerifiedError();
    }
    throw new Error(formatApiError(data));
  }

  return data as LoginResult;
}


// --- 3. Token Management & Interceptor ---
const ACCESS_TOKEN_KEY = "ruqi_access_token";
const REFRESH_TOKEN_KEY = "ruqi_refresh_token";
const PENDING_EMAIL_KEY = "ruqi_pending_email";

export function saveTokens(tokens: { accessToken: string; refreshToken: string }) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return Boolean(getAccessToken());
}

export async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/auth/get-new-access-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
  } catch {
    return false;
  }

  if (!res.ok) return false;

  const data = await safeJson(res);

  const newAccessToken = data.accessToken || data.tokens?.accessToken;
  const newRefreshToken = data.refreshToken || data.tokens?.refreshToken;

  if (!newAccessToken || !newRefreshToken) return false;

  saveTokens({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  return true;
}

async function authedFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const withAuth = (token: string | null) => ({
    ...init,
    headers: {
      ...init.headers,
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  let res: Response;
  try {
    res = await fetch(url, withAuth(getAccessToken()));
  } catch {
    throw new Error("تعذر الاتصال بالخادم");
  }

  if (res.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      try {
        res = await fetch(url, withAuth(getAccessToken()));
      } catch {
        throw new Error("تعذر الاتصال بالخادم");
      }
    } else {
      clearTokens();
    }
  }

  return res;
}


// --- 4. User Profile ---
export interface UserProfile {
  _id: string;
  studentId: string;
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  role: string;
  status: string;
  stage: string;
  createdAt: string;
  updatedAt: string;
}

export async function getProfile(): Promise<UserProfile> {
  const res = await authedFetch(`${API_BASE_URL}/users/me`);
  const data = await safeJson(res);

  if (!res.ok) {
    if (res.status === 401) clearTokens();
    throw new Error(formatApiError(data));
  }

  return normalizeProfile(data);
}

function normalizeProfile(data: unknown): UserProfile {
  const src =
    data && typeof data === "object" && "user" in (data as Record<string, unknown>)
      ? ((data as Record<string, unknown>).user as Record<string, unknown>)
      : (data as Record<string, unknown>);

  const raw = Array.isArray(src) ? (src[0] as Record<string, unknown>) : src;

  const rawStage = raw?.stage ?? raw?.educationalStage;
  const stageId =
    rawStage && typeof rawStage === "object"
      ? String((rawStage as Record<string, unknown>)._id ?? (rawStage as Record<string, unknown>).id ?? "")
      : String(rawStage ?? "");

  return {
    _id: String(raw?._id ?? raw?.id ?? ""),
    studentId: String(raw?.studentId ?? ""),
    name: String(raw?.name ?? ""),
    email: String(raw?.email ?? ""),
    phoneNumber: String(raw?.phoneNumber ?? ""),
    address: String(raw?.address ?? ""),
    role: String(raw?.role ?? ""),
    status: String(raw?.status ?? ""),
    stage: stageId,
    createdAt: String(raw?.createdAt ?? ""),
    updatedAt: String(raw?.updatedAt ?? ""),
  };
}

export interface UpdateStudentProfilePayload {
  name?: string;
  password?: string;
  phoneNumber?: string;
  address?: string;
  stage?: string;
  avatar?: string;
}

export async function updateStudentProfile(payload: UpdateStudentProfilePayload): Promise<UserProfile> {
  const body: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (key === "stage") {
      const isValid = typeof value === "string" && /^[a-fA-F0-9]{24}$/.test(value.trim());
      if (isValid) body[key] = value.trim();
      continue;
    }
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      body[key] = value;
    }
  }

  const res = await authedFetch(`${API_BASE_URL}/users/student/profile`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await safeJson(res);

  if (!res.ok) {
    if (res.status === 401) clearTokens();
    throw new Error(formatApiError(data));
  }

  return normalizeProfile(data);
}


// --- 5. Utilities ---
export function savePendingEmail(email: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem(PENDING_EMAIL_KEY, email);
  }
}

export function getPendingEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(PENDING_EMAIL_KEY);
}

export async function logoutUser(): Promise<void> {
  const token = getAccessToken();
  if (token) {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {}
  }
  clearTokens();
}

export async function forgetPassword(email: string): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/auth/forget-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const data = await safeJson(response);
  if (!response.ok) {
    throw new Error(formatApiError(data));
  }
  return data;
}

export async function resetPassword(body: {
  email: string;
  otp: string;
  newPassword: string;
}): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await safeJson(response);
  if (!response.ok) {
    throw new Error(formatApiError(data));
  }
  return data;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function safeJson(res: Response): Promise<any> {
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    throw new Error(
      res.ok ? "استجابة غير متوقعة من الخادم" : "تعذر الاتصال بالخادم، يرجى المحاولة لاحقاً"
    );
  }
  return res.json();
}

function formatApiError(data: unknown): string {
  if (!data || typeof data !== "object") return "حدث خطأ ما";

  const raw = (data as { message?: unknown }).message;

  if (Array.isArray(raw)) {
    return raw.filter((i): i is string => typeof i === "string").join("، ");
  }

  if (typeof raw === "string") return raw;

  return "حدث خطأ ما";
}

// --- Educational Content (Months) ---
export interface EducationalMonth {
  _id: string;
  title: string;
  description?: string;
  image?: string;
  price: number;
  stage: string;
  order: number;
}

export async function getEducationalMonths(stageId: string): Promise<EducationalMonth[]> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/educational-content/months/stage/${stageId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    throw new Error("تعذر الاتصال بالخادم");
  }

  const data = await safeJson(res);
  if (!res.ok) {
    throw new Error(formatApiError(data));
  }
  return data as EducationalMonth[];
}

export async function getEducationalStageById(id: string): Promise<EducationalStage> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/educational-content/stages/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    throw new Error("تعذر الاتصال بالخادم");
  }

  const data = await safeJson(res);
  if (!res.ok) {
    throw new Error(formatApiError(data));
  }
  return data as EducationalStage;
}


// --- Educational Content (Month Details & Content) ---

export interface ContentItem {
  _id: string;
  title: string;
  description?: string;
  type: "LESSON" | "EXAM";
  order: number;
}

export async function getEducationalMonthById(id: string): Promise<EducationalMonth> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/educational-content/months/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    throw new Error("تعذر الاتصال بالخادم");
  }

  const data = await safeJson(res);
  if (!res.ok) {
    throw new Error(formatApiError(data));
  }
  return data as EducationalMonth;
}


export async function getMonthContent(monthId: string): Promise<ContentItem[]> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/educational-content/content/month/${monthId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    throw new Error("تعذر الاتصال بالخادم");
  }

  const data = await safeJson(res);
  if (!res.ok) {
    throw new Error(formatApiError(data));
  }
  return data as ContentItem[];
}

// --- Educational Content (Lesson & Exam Details) ---

export interface Question {
  questionText: string;
  options: string[];
  correctAnswers: number[];
}

export interface ContentDetails {
  _id: string;
  title: string;
  description?: string;
  type: "LESSON" | "EXAM";
  videoUrl?: string;
  writtenExplanation?: string;
  homework?: Question[];
  examQuestions?: Question[];
  passPercentage?: number;
  order: number;
  month: string;
}

export async function getContentById(id: string): Promise<ContentDetails> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/educational-content/content/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    throw new Error("تعذر الاتصال بالخادم");
  }

  const data = await safeJson(res);
  if (!res.ok) {
    throw new Error(formatApiError(data));
  }
  return data as ContentDetails;
}