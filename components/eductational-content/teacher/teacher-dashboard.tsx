"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Loader2, Plus } from "lucide-react";
import {
  getEducationalStages,
  createStage,
  updateStage,
  deleteStage,
  reorderStages,
  getMonthsByStage,
  createMonth,
  updateMonth,
  deleteMonth,
  reorderMonths,
  getContentByMonth,
  createLesson,
  createExam,
  updateContent,
  deleteContent,
  reorderContent,
  type EducationalStage,
  type Month,
  type LessonExam,
  type ContentType,
  type ContentQuestion,
} from "@/lib/api";
import ConfirmModal from "./modals/confirm-modal";
import StageModal from "./modals/stage-modal";
import MonthModal from "./modals/month-modal";
import ContentModal from "./modals/content-modal";

type ModalMode = "create" | "edit";
type DeleteTarget =
  | { kind: "stage"; stage: EducationalStage }
  | { kind: "month"; stage: EducationalStage; month: Month }
  | { kind: "content"; stage: EducationalStage; month: Month; content: LessonExam };

function validateQuestion(q: ContentQuestion): string | null {
  if (!q.questionText.trim()) return "أحد الأسئلة لا يحتوي على نص السؤال";
  if (q.options.length < 2) return "يجب أن يحتوي كل سؤال على خيارين على الأقل";
  if (q.correctAnswers.length < 1) return "يجب تحديد إجابة صحيحة واحدة على الأقل لكل سؤال";
  if (q.correctAnswers.some((c) => !Number.isInteger(c) || c < 0 || c >= q.options.length))
    return "إحدى الإجابات الصحيحة غير موجودة ضمن الخيارات";
  return null;
}

export default function TeacherDashboard() {
  // ---- Data states ----
  const [stages, setStages] = useState<EducationalStage[]>([]);
  const [loadingStages, setLoadingStages] = useState(true);
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);

  const [months, setMonths] = useState<Month[]>([]);
  const [loadingMonths, setLoadingMonths] = useState(false);
  const [selectedMonthId, setSelectedMonthId] = useState<string | null>(null);

  const [content, setContent] = useState<LessonExam[]>([]);
  const [loadingContent, setLoadingContent] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // ---- Modal states ----
  const [stageModalOpen, setStageModalOpen] = useState(false);
  const [stageModalMode, setStageModalMode] = useState<ModalMode>("create");
  const [editingStage, setEditingStage] = useState<EducationalStage | null>(null);

  const [monthModalOpen, setMonthModalOpen] = useState(false);
  const [monthModalMode, setMonthModalMode] = useState<ModalMode>("create");
  const [editingMonth, setEditingMonth] = useState<Month | null>(null);

  const [contentModalOpen, setContentModalOpen] = useState(false);
  const [contentModalMode, setContentModalMode] = useState<ModalMode>("create");
  const [editingContent, setEditingContent] = useState<LessonExam | null>(null);
  const [contentType, setContentType] = useState<ContentType>("LESSON");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // ---- Load stages ----
  const loadStages = useCallback(async () => {
    setLoadingStages(true);
    setError(null);
    try {
      const data = await getEducationalStages();
      const sorted = [...data].sort((a, b) => a.order - b.order);
      setStages(sorted);
      if (sorted.length > 0 && !selectedStageId) {
        setSelectedStageId(sorted[0]._id);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ أثناء تحميل المراحل");
    } finally {
      setLoadingStages(false);
    }
  }, [selectedStageId]);

  useEffect(() => {
    loadStages();
  }, [loadStages]);

  // ---- Load months for selected stage ----
  const loadMonths = useCallback(async (stageId: string | null) => {
    if (!stageId) {
      setMonths([]);
      setContent([]);
      setSelectedMonthId(null);
      return;
    }
    setLoadingMonths(true);
    setError(null);
    try {
      const data = await getMonthsByStage(stageId);
      const sorted = [...data].sort((a, b) => a.order - b.order);
      setMonths(sorted);
      setSelectedMonthId(sorted.length > 0 ? sorted[0]._id : null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ أثناء تحميل الأشهر");
      setMonths([]);
      setSelectedMonthId(null);
    } finally {
      setLoadingMonths(false);
    }
  }, []);

  useEffect(() => {
    loadMonths(selectedStageId);
  }, [selectedStageId, loadMonths]);

  // ---- Load content for selected month ----
  const loadContent = useCallback(async (monthId: string | null) => {
    if (!monthId) {
      setContent([]);
      return;
    }
    setLoadingContent(true);
    setError(null);
    try {
      const data = await getContentByMonth(monthId);
      setContent([...data].sort((a, b) => a.order - b.order));
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ أثناء تحميل المحتوى");
      setContent([]);
    } finally {
      setLoadingContent(false);
    }
  }, []);

  useEffect(() => {
    loadContent(selectedMonthId);
  }, [selectedMonthId, loadContent]);

  const selectedStage = stages.find((s) => s._id === selectedStageId) ?? null;
  const selectedMonth = months.find((m) => m._id === selectedMonthId) ?? null;

  // ============ Helper: reorder array locally + call API ============
  const moveItem = async <T extends { _id: string; order: number }>(
    list: T[],
    index: number,
    dir: -1 | 1,
    setList: (items: T[]) => void,
    apiFn: (items: { id: string; order: number }[]) => Promise<unknown>,
  ) => {
    const target = index + dir;
    if (target < 0 || target >= list.length) return;
    const reordered = [...list];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(target, 0, moved);
    const updated = reordered.map((item, i) => ({ ...item, order: i }));
    setList(updated);
    try {
      await apiFn(updated.map((item) => ({ id: item._id, order: item.order })));
    } catch (e) {
      await loadStages();
      setError(e instanceof Error ? e.message : "حدث خطأ أثناء إعادة الترتيب");
    }
  };

  // ============ Stage handlers ============
  const handleStageSave = async (data: { title: string; image: string }) => {
    setSaving(true);
    setModalError(null);
    try {
      if (stageModalMode === "create") {
        await createStage({ title: data.title, image: data.image || undefined });
      } else if (editingStage) {
        await updateStage(editingStage._id, { title: data.title, image: data.image || undefined });
      }
      await loadStages();
      setStageModalOpen(false);
    } catch (e) {
      setModalError(e instanceof Error ? e.message : "حدث خطأ أثناء حفظ المرحلة");
    } finally {
      setSaving(false);
    }
  };

  // ============ Month handlers ============
  const handleMonthSave = async (data: { title: string; description: string; price: number; image: string }) => {
    if (!selectedStageId) return;
    setSaving(true);
    setModalError(null);
    try {
      if (monthModalMode === "create") {
        await createMonth({
          title: data.title,
          description: data.description,
          price: data.price,
          image: data.image || undefined,
          stage: selectedStageId,
        });
      } else if (editingMonth) {
        await updateMonth(editingMonth._id, {
          title: data.title,
          description: data.description,
          price: data.price,
          image: data.image || undefined,
        });
      }
      await loadMonths(selectedStageId);
      setMonthModalOpen(false);
    } catch (e) {
      setModalError(e instanceof Error ? e.message : "حدث خطأ أثناء حفظ الشهر");
    } finally {
      setSaving(false);
    }
  };

  // ============ Content handlers ============
  const handleContentSave = async (data: {
    title: string;
    description: string;
    videoUrl: string;
    writtenExplanation: string;
    passPercentage: number;
    questions: ContentQuestion[];
  }) => {
    if (!selectedMonthId) return;
    const validQuestions = data.questions.filter(
      (q) => q.questionText.trim() && q.options.length >= 2 && q.correctAnswers.length >= 1,
    );
    for (const q of validQuestions) {
      const qError = validateQuestion(q);
      if (qError) {
        setModalError(qError);
        return;
      }
    }

    setSaving(true);
    setModalError(null);
    try {
      const month = selectedMonthId;
      if (contentModalMode === "create") {
        if (contentType === "LESSON") {
          await createLesson({
            type: "LESSON",
            title: data.title,
            description: data.description,
            month,
            videoUrl: data.videoUrl,
            writtenExplanation: data.writtenExplanation,
            homework: validQuestions,
          });
        } else {
          await createExam({
            type: "EXAM",
            title: data.title,
            description: data.description,
            month,
            examQuestions: validQuestions,
            passPercentage: data.passPercentage,
          });
        }
      } else if (editingContent) {
        const payload: Record<string, unknown> = {
          title: data.title,
          description: data.description,
          order: editingContent.order,
        };
        if (editingContent.type === "LESSON") {
          payload.videoUrl = data.videoUrl || undefined;
          payload.writtenExplanation = data.writtenExplanation || undefined;
          payload.homework = validQuestions;
        } else {
          payload.examQuestions = validQuestions;
          payload.passPercentage = data.passPercentage;
        }
        await updateContent(editingContent._id, payload);
      }
      await loadContent(selectedMonthId);
      setContentModalOpen(false);
    } catch (e) {
      setModalError(e instanceof Error ? e.message : "حدث خطأ أثناء حفظ المحتوى");
    } finally {
      setSaving(false);
    }
  };

  // ============ Delete handler ============
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setModalError(null);
    try {
      if (deleteTarget.kind === "stage") {
        await deleteStage(deleteTarget.stage._id);
        setSelectedStageId(null);
        setStages([]);
        await loadStages();
      } else if (deleteTarget.kind === "month") {
        await deleteMonth(deleteTarget.month._id);
        if (selectedStageId) await loadMonths(selectedStageId);
      } else {
        await deleteContent(deleteTarget.content._id);
        if (selectedMonthId) await loadContent(selectedMonthId);
      }
      setConfirmOpen(false);
      setDeleteTarget(null);
    } catch (e) {
      setModalError(e instanceof Error ? e.message : "حدث خطأ أثناء الحذف");
    } finally {
      setDeleting(false);
    }
  };

  const deleteMessage = (() => {
    if (!deleteTarget) return "";
    if (deleteTarget.kind === "stage")
      return `سيتم حذف المرحلة "${deleteTarget.stage.title}" وجميع الأشهر والمحتوى المرتبط بها. لا يمكن التراجع عن هذا الإجراء.`;
    if (deleteTarget.kind === "month")
      return `سيتم حذف الشهر "${deleteTarget.month.title}" وجميع الدروس والاختبارات المرتبطة به. لا يمكن التراجع عن هذا الإجراء.`;
    return `سيتم حذف "${deleteTarget.content.title}" نهائياً. لا يمكن التراجع عن هذا الإجراء.`;
  })();

  return (
    <div
      className="w-full min-h-screen bg-background font-cairo py-10 px-4 md:px-8 lg:px-[80px] overflow-x-hidden"
      dir="rtl"
    >
      <main className="w-full max-w-[1280px] mx-auto flex flex-col gap-8">
        {/* Error banner */}
        {error && (
          <div className="bg-danger-bg border border-danger text-danger font-bold text-[13px] p-4 rounded-xl text-center">
            {error}
          </div>
        )}

        {/* 1. Stages Management */}
        <section className="flex flex-col gap-4 w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="font-extrabold text-[20px] text-text-main">المراحل الدراسية</h2>
            <button
              onClick={() => {
                setStageModalMode("create");
                setEditingStage(null);
                setModalError(null);
                setStageModalOpen(true);
              }}
              className="w-full sm:w-auto shrink-0 bg-primary hover:bg-primary-hover text-text-main font-bold text-[14px] px-5 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1"
            >
              <Plus size={16} />
              إضافة مرحلة دراسية
            </button>
          </div>

          {loadingStages ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-primary-hover" size={32} />
            </div>
          ) : stages.length === 0 ? (
            <div className="bg-surface border border-border rounded-xl p-8 text-center text-text-muted font-bold">
              لا توجد مراحل دراسية بعد. ابدأ بإضافة مرحلة جديدة.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stages.map((stage, index) => (
                <div
                  key={stage._id}
                  onClick={() => setSelectedStageId(stage._id)}
                  className={`cursor-pointer flex flex-col gap-4 border rounded-[16px] p-5 transition-colors ${
                    selectedStageId === stage._id
                      ? "bg-primary-light border-[1.5px] border-primary"
                      : "bg-surface border-[1.5px] border-border hover:border-primary"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <span className="font-extrabold text-[16px] text-text-main break-words flex-1 min-w-0">
                      {stage.title}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveItem(stages, index, -1, setStages, reorderStages);
                        }}
                        disabled={index === 0}
                        className="disabled:opacity-30 text-primary-hover hover:bg-surface rounded p-1.5 transition-colors"
                        aria-label="تحريك لأعلى"
                      >
                        <ArrowUp size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveItem(stages, index, 1, setStages, reorderStages);
                        }}
                        disabled={index === stages.length - 1}
                        className="disabled:opacity-30 text-primary-hover hover:bg-surface rounded p-1.5 transition-colors"
                        aria-label="تحريك لأسفل"
                      >
                        <ArrowDown size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-auto pt-2 border-t border-border/50">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget({ kind: "stage", stage });
                        setModalError(null);
                        setConfirmOpen(true);
                      }}
                      className="bg-danger-bg text-danger hover:bg-danger-hover hover:text-white font-bold text-[12px] px-3 py-1.5 rounded-md transition-colors flex-1 text-center shrink-0"
                    >
                      حذف
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setStageModalMode("edit");
                        setEditingStage(stage);
                        setModalError(null);
                        setStageModalOpen(true);
                      }}
                      className="bg-primary-light border border-primary-border text-primary-hover hover:bg-primary-hover hover:text-white font-bold text-[12px] px-3 py-1.5 rounded-md transition-colors flex-1 text-center shrink-0"
                    >
                      تعديل
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 2. Months Management */}
        <section className="flex flex-col gap-4 w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
            <h2 className="font-extrabold text-[20px] text-text-main flex-1 min-w-0 break-words">
              إدارة الأشهر {selectedStage ? `[${selectedStage.title}]` : ""}
            </h2>
            {selectedStage && (
              <button
                onClick={() => {
                  setMonthModalMode("create");
                  setEditingMonth(null);
                  setModalError(null);
                  setMonthModalOpen(true);
                }}
                className="w-full sm:w-auto shrink-0 border border-primary text-primary-hover hover:bg-primary-light font-bold text-[14px] px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                <Plus size={16} />
                إنشاء شهر جديد
              </button>
            )}
          </div>

          {!selectedStage ? (
            <div className="bg-surface border border-border rounded-xl p-8 text-center text-text-muted font-bold">
              اختر مرحلة دراسية لعرض أشهرها.
            </div>
          ) : loadingMonths ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-primary-hover" size={32} />
            </div>
          ) : months.length === 0 ? (
            <div className="bg-surface border border-border rounded-xl p-8 text-center text-text-muted font-bold">
              لا توجد أشهر لهذه المرحلة. أنشئ شهراً جديداً.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {months.map((month, index) => (
                <div
                  key={month._id}
                  onClick={() => setSelectedMonthId(month._id)}
                  className={`cursor-pointer flex flex-col gap-4 border rounded-xl p-5 transition-colors ${
                    selectedMonthId === month._id
                      ? "bg-primary-light border-[1.5px] border-primary"
                      : "bg-surface border-[1.5px] border-border hover:border-primary"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <span className="font-bold text-[15px] text-text-main break-words">{month.title}</span>
                      <span className="font-normal text-[13px] text-text-muted">
                        {month.price > 0 ? `السعر: ${month.price} ج.م` : "مجاني"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveItem(months, index, -1, setMonths, reorderMonths);
                        }}
                        disabled={index === 0}
                        className="disabled:opacity-30 text-primary-hover hover:bg-surface rounded p-1.5 transition-colors"
                        aria-label="تحريك لأعلى"
                      >
                        <ArrowUp size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveItem(months, index, 1, setMonths, reorderMonths);
                        }}
                        disabled={index === months.length - 1}
                        className="disabled:opacity-30 text-primary-hover hover:bg-surface rounded p-1.5 transition-colors"
                        aria-label="تحريك لأسفل"
                      >
                        <ArrowDown size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-auto pt-2 border-t border-border/50">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget({ kind: "month", stage: selectedStage, month });
                        setModalError(null);
                        setConfirmOpen(true);
                      }}
                      className="bg-danger-bg text-danger hover:bg-danger-hover hover:text-white font-bold text-[12px] px-3 py-1.5 rounded-md transition-colors flex-1 text-center shrink-0"
                    >
                      حذف
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMonthModalMode("edit");
                        setEditingMonth(month);
                        setModalError(null);
                        setMonthModalOpen(true);
                      }}
                      className="bg-primary-light border border-primary-border text-primary-hover hover:bg-primary-hover hover:text-white font-bold text-[12px] px-3 py-1.5 rounded-md transition-colors flex-1 text-center shrink-0"
                    >
                      تعديل
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 3. Content Management */}
        <section className="flex flex-col gap-4 w-full pb-12">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 w-full">
            <h2 className="font-extrabold text-[20px] text-text-main flex-1 min-w-0 break-words">
              المحتوى المتتابع {selectedMonth ? `[${selectedMonth.title}]` : ""}
            </h2>
            {selectedMonth && (
              <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full lg:w-auto shrink-0">
                <button
                  onClick={() => {
                    setContentModalMode("create");
                    setEditingContent(null);
                    setContentType("EXAM");
                    setModalError(null);
                    setContentModalOpen(true);
                  }}
                  className="bg-text-main hover:bg-black text-primary font-bold text-[14px] px-5 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1 w-full sm:w-auto shrink-0"
                >
                  <Plus size={16} />
                  إنشاء اختبار
                </button>
                <button
                  onClick={() => {
                    setContentModalMode("create");
                    setEditingContent(null);
                    setContentType("LESSON");
                    setModalError(null);
                    setContentModalOpen(true);
                  }}
                  className="bg-primary hover:bg-primary-hover text-text-main font-bold text-[14px] px-5 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1 w-full sm:w-auto shrink-0"
                >
                  <Plus size={16} />
                  إنشاء درس
                </button>
              </div>
            )}
          </div>

          {!selectedMonth ? (
            <div className="bg-surface border border-border rounded-xl p-8 text-center text-text-muted font-bold">
              اختر شهراً لعرض محتواه.
            </div>
          ) : loadingContent ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-primary-hover" size={32} />
            </div>
          ) : content.length === 0 ? (
            <div className="bg-surface border border-border rounded-xl p-8 text-center text-text-muted font-bold">
              لا يوجد محتوى في هذا الشهر بعد.
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-[16px] flex flex-col overflow-hidden">
              {content.map((item, index) => (
                <div
                  key={item._id}
                  className={`flex flex-col lg:flex-row justify-between items-start lg:items-center p-5 gap-5 ${
                    index !== content.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3 w-full lg:w-auto flex-1 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 sm:mt-0 ${
                        item.type === "EXAM" ? "bg-success-bg" : "bg-primary-light"
                      }`}
                    >
                      <span
                        className={`font-extrabold text-[14px] ${
                          item.type === "EXAM" ? "text-success" : "text-primary-hover"
                        }`}
                      >
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 flex-1 min-w-0">
                      <h3 className="font-semibold text-[15px] text-text-main break-words">{item.title}</h3>
                      <span
                        className={`font-bold text-[12px] px-3 py-1 rounded-md w-fit whitespace-nowrap shrink-0 ${
                          item.type === "EXAM" ? "bg-success-bg text-success" : "bg-primary-light text-primary-hover"
                        }`}
                      >
                        {item.type === "EXAM" ? "اختبار" : "درس مرئي"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto w-full lg:w-auto justify-end shrink-0">
                    <div className="flex items-center gap-1 shrink-0 ml-auto lg:ml-2">
                      <button
                        type="button"
                        onClick={() => moveItem(content, index, -1, setContent, reorderContent)}
                        disabled={index === 0}
                        className="disabled:opacity-30 text-primary-hover hover:bg-surface rounded p-1.5 transition-colors"
                        aria-label="تحريك لأعلى"
                      >
                        <ArrowUp size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveItem(content, index, 1, setContent, reorderContent)}
                        disabled={index === content.length - 1}
                        className="disabled:opacity-30 text-primary-hover hover:bg-surface rounded p-1.5 transition-colors"
                        aria-label="تحريك لأسفل"
                      >
                        <ArrowDown size={16} />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteTarget({
                          kind: "content",
                          stage: selectedStage!,
                          month: selectedMonth,
                          content: item,
                        });
                        setModalError(null);
                        setConfirmOpen(true);
                      }}
                      className="bg-danger-bg text-danger hover:bg-danger-hover hover:text-white font-bold text-[12px] px-3 py-1.5 rounded-md transition-colors flex-1 sm:flex-none text-center shrink-0"
                    >
                      حذف
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setContentModalMode("edit");
                        setEditingContent(item);
                        setContentType(item.type);
                        setModalError(null);
                        setContentModalOpen(true);
                      }}
                      className="bg-primary-light border border-primary-border text-primary-hover hover:bg-primary-hover hover:text-white font-bold text-[12px] px-3 py-1.5 rounded-md transition-colors flex-1 sm:flex-none text-center shrink-0"
                    >
                      تعديل
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* ---- Modals ---- */}
      <StageModal
        open={stageModalOpen}
        mode={stageModalMode}
        initialTitle={editingStage?.title ?? ""}
        initialImage={editingStage?.image ?? ""}
        saving={saving}
        error={modalError}
        onSave={handleStageSave}
        onClose={() => setStageModalOpen(false)}
      />

      <MonthModal
        open={monthModalOpen}
        mode={monthModalMode}
        initialTitle={editingMonth?.title ?? ""}
        initialDescription={editingMonth?.description ?? ""}
        initialPrice={editingMonth?.price ?? 0}
        initialImage={editingMonth?.image ?? ""}
        saving={saving}
        error={modalError}
        onSave={handleMonthSave}
        onClose={() => setMonthModalOpen(false)}
      />

      <ContentModal
        open={contentModalOpen}
        mode={contentModalMode}
        type={contentType}
        initialTitle={editingContent?.title ?? ""}
        initialDescription={editingContent?.description ?? ""}
        initialVideoUrl={editingContent?.videoUrl ?? ""}
        initialWrittenExplanation={editingContent?.writtenExplanation ?? ""}
        initialPassPercentage={editingContent?.passPercentage ?? 50}
        initialQuestions={
          editingContent
            ? ((editingContent.type === "EXAM" ? editingContent.examQuestions : editingContent.homework) ?? [])
            : []
        }
        saving={saving}
        error={modalError}
        onSave={handleContentSave}
        onClose={() => setContentModalOpen(false)}
        onSwitchType={setContentType}
      />

      <ConfirmModal
        open={confirmOpen}
        title="تأكيد الحذف"
        message={deleteMessage}
        loading={deleting}
        error={modalError}
        onConfirm={handleDelete}
        onClose={() => {
          setConfirmOpen(false);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
