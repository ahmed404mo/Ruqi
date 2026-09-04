"use client";

import { useState, useEffect } from "react";

interface StudentRank {
  id: string | number;
  name: string;
  stage: string;
  points: number;
  rank: number;
  imageUrl: string;
  isCurrentUser?: boolean;
}

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<string>("على مستوى المنصة");
  const [students, setStudents] = useState<StudentRank[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const tabs = ["على مستوى المنصة"];

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/backend/leaderboard?tab=${encodeURIComponent(activeTab)}`);
        const data = await response.json();
        const list = Array.isArray(data) ? data : Array.isArray(data?.students) ? data.students : [];
        setStudents(list);
      } catch {
        setStudents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [activeTab]);

  const topThree = students.filter((s) => s.rank <= 3).sort((a, b) => a.rank - b.rank);
  const otherRanks = students.filter((s) => s.rank > 3).sort((a, b) => a.rank - b.rank);

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return "bg-[#E6C15C]";
    if (rank === 2) return "bg-[#B8C2C7]";
    if (rank === 3) return "bg-[#CFA085]";
    return "bg-primary-light";
  };

  return (
    <div
      dir="rtl"
      className="w-full min-h-screen bg-background flex flex-col items-center overflow-hidden py-20 px-4 md:px-8"
    >
      <main className="flex flex-col items-center px-4 md:px-8 gap-10 md:gap-14 w-full max-w-7xl">
        <div className="flex flex-col items-center gap-4 w-full text-center">
          <div className="flex flex-row items-center gap-3">
            <div className="w-7.5 md:w-10 h-[1.5px] bg-primary"></div>
            <div className="w-3.5 md:w-4.5 h-3.5 md:h-4.5 border-2 border-primary rotate-45"></div>
            <div className="w-7.5 md:w-10 h-[1.5px] bg-primary"></div>
          </div>
          <h1 className="font-extrabold text-[28px] md:text-[36px] text-text-main leading-snug md:leading-16.75">
            المتفوقون في رُقِيّ
          </h1>
          <p className="font-medium text-[14px] md:text-[16px] text-text-muted leading-relaxed md:leading-6.5">
            لوحة الشرف لتكريم الطلاب الأكثر تميزاً وجدية في إنهاء المهام الدراسية
          </p>
        </div>

        <div className="flex flex-row flex-wrap justify-center items-center gap-3 w-full">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 md:px-6 py-2 rounded-xl border text-[13px] md:text-[14px] font-bold transition-all duration-200 ${
                activeTab === tab
                  ? "bg-primary border-primary text-[#1E1A17]"
                  : "bg-surface border-border text-text-muted hover:border-primary hover:text-primary"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center w-full py-24">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : students.length > 0 ? (
          <div className="flex flex-col w-full gap-14 items-center">
            {topThree.length > 0 && (
              <div className="flex flex-col md:flex-row justify-center items-center md:items-end gap-6 w-full">
                {topThree.find((s) => s.rank === 2) && (
                  <div className="flex flex-col items-center p-6 gap-4 w-full md:w-75.5 bg-surface border border-border shadow-lg rounded-[20px] order-2 md:order-1 hover:-translate-y-1 transition-transform duration-300">
                    <div className="relative w-18 h-18 rounded-full bg-background">
                      <div
                        className="w-full h-full rounded-full bg-cover bg-center"
                        style={{
                          backgroundImage: `url('${topThree.find((s) => s.rank === 2)?.imageUrl}')`,
                        }}
                      ></div>
                      <div
                        className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex justify-center items-center ${getRankBadgeColor(2)} text-white font-extrabold text-[12px]`}
                      >
                        ٢
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-bold text-[16px] text-text-main truncate max-w-50">
                        {topThree.find((s) => s.rank === 2)?.name}
                      </span>
                      <span className="font-normal text-[12px] text-text-muted">
                        {topThree.find((s) => s.rank === 2)?.stage}
                      </span>
                    </div>
                    <div className="px-3 py-1 bg-primary-light rounded-md">
                      <span className="font-bold text-[13px] text-primary">المركز الثاني</span>
                    </div>
                    <span className="font-extrabold text-[18px] text-text-main">
                      {topThree.find((s) => s.rank === 2)?.points} نقطة
                    </span>
                  </div>
                )}

                {topThree.find((s) => s.rank === 1) && (
                  <div className="flex flex-col items-center p-8 gap-5 w-full md:w-77 bg-[#1E1A17] shadow-[0_12px_32px_-4px_rgba(212,175,55,0.1)] rounded-3xl order-1 md:order-2 z-10 hover:-translate-y-2 transition-transform duration-300">
                    <div className="relative w-24 h-24 rounded-full bg-background border-2 border-primary">
                      <div
                        className="w-full h-full rounded-full bg-cover bg-center"
                        style={{
                          backgroundImage: `url('${topThree.find((s) => s.rank === 1)?.imageUrl}')`,
                        }}
                      ></div>
                      <div
                        className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex justify-center items-center ${getRankBadgeColor(1)}`}
                      >
                        <svg className="w-4 h-4 text-[#1E1A17]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94A5.01 5.01 0 0011 15.9V19H7v2h10v-2h-4v-3.1a5.01 5.01 0 003.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM7 10.82C5.84 10.4 5 9.3 5 8V7h2v3.82zM19 8c0 1.3-.84 2.4-2 2.82V7h2v1z" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-1.5">
                      <span className="font-extrabold text-[20px] text-white truncate max-w-55">
                        {topThree.find((s) => s.rank === 1)?.name}
                      </span>
                      <span className="font-normal text-[13px] text-[#FAF3E6] opacity-80">
                        {topThree.find((s) => s.rank === 1)?.stage}
                      </span>
                    </div>
                    <div className="px-4 py-1.5 bg-primary rounded-lg">
                      <span className="font-extrabold text-[12px] text-[#1E1A17]">المركز الأول</span>
                    </div>
                    <span className="font-black text-[22px] text-primary">
                      {topThree.find((s) => s.rank === 1)?.points} نقطة
                    </span>
                  </div>
                )}

                {topThree.find((s) => s.rank === 3) && (
                  <div className="flex flex-col items-center p-6 gap-4 w-full md:w-75.5 bg-surface border border-border shadow-lg rounded-[20px] order-3 hover:-translate-y-1 transition-transform duration-300">
                    <div className="relative w-18 h-18 rounded-full bg-background">
                      <div
                        className="w-full h-full rounded-full bg-cover bg-center"
                        style={{
                          backgroundImage: `url('${topThree.find((s) => s.rank === 3)?.imageUrl}')`,
                        }}
                      ></div>
                      <div
                        className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex justify-center items-center ${getRankBadgeColor(3)} text-white font-extrabold text-[12px]`}
                      >
                        ٣
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-bold text-[16px] text-text-main truncate max-w-50">
                        {topThree.find((s) => s.rank === 3)?.name}
                      </span>
                      <span className="font-normal text-[12px] text-text-muted">
                        {topThree.find((s) => s.rank === 3)?.stage}
                      </span>
                    </div>
                    <div className="px-3 py-1 bg-primary-light rounded-md">
                      <span className="font-bold text-[13px] text-primary">المركز الثالث</span>
                    </div>
                    <span className="font-extrabold text-[18px] text-text-main">
                      {topThree.find((s) => s.rank === 3)?.points} نقطة
                    </span>
                  </div>
                )}
              </div>
            )}

            {otherRanks.length > 0 && (
              <div className="w-full overflow-x-auto rounded-[20px] border border-border shadow-sm bg-surface">
                <table className="w-full min-w-175 text-center border-collapse">
                  <thead className="bg-primary-light">
                    <tr>
                      <th className="py-5 px-4 font-bold text-[14px] text-text-main w-1/4">مجموع النقاط</th>
                      <th className="py-5 px-4 font-bold text-[14px] text-text-main w-1/4">المرحلة الدراسية</th>
                      <th className="py-5 px-4 font-bold text-[14px] text-text-main w-1/4">اسم الطالب</th>
                      <th className="py-5 px-4 font-bold text-[14px] text-text-main w-1/4">المركز</th>
                    </tr>
                  </thead>
                  <tbody>
                    {otherRanks.map((student) => (
                      <tr
                        key={student.id}
                        className={`border-t border-border transition-colors ${
                          student.isCurrentUser ? "bg-primary-light" : "bg-surface hover:bg-gray-50"
                        }`}
                      >
                        <td
                          className={`py-5 px-4 font-extrabold text-[15px] ${student.isCurrentUser ? "text-primary" : "text-text-main"}`}
                        >
                          {student.points}
                        </td>
                        <td className="py-5 px-4 font-medium text-[14px] text-text-muted">{student.stage}</td>
                        <td className="py-5 px-4 font-bold text-[15px] text-text-main">
                          {student.name} {student.isCurrentUser && "(أنت)"}
                        </td>
                        <td className="py-5 px-4 font-bold text-[15px] text-primary">
                          المركز{" "}
                          {student.rank === 4
                            ? "الرابع"
                            : student.rank === 5
                              ? "الخامس"
                              : student.rank === 6
                                ? "السادس"
                                : student.rank === 7
                                  ? "السابع"
                                  : student.rank === 8
                                    ? "الثامن"
                                    : student.rank === 9
                                      ? "التاسع"
                                      : student.rank === 10
                                        ? "العاشر"
                                        : student.rank}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full py-20 md:py-32 px-5 bg-surface border border-border rounded-card text-center">
            <svg
              className="w-20 h-20 md:w-24 md:h-24 text-primary opacity-40 mb-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
            <h3 className="font-extrabold text-[20px] md:text-[24px] text-text-main mb-3">
              لم يتم تسجيل أي نقاط أو مراكز في لوحة الشرف حتى الآن،
              <br />
              بادر بالتفوق وكن أول المنضمين!
            </h3>
          </div>
        )}
      </main>
    </div>
  );
}
