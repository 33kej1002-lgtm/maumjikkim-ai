"use client";

import { useState } from "react";
import { learningCases, LearningCase } from "@/data/cases";
import { complaintTypes } from "@/data/complaintTypes";
import Link from "next/link";

export default function LearnPage() {
  const [selectedCase, setSelectedCase] = useState<LearningCase | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchText, setSearchText] = useState("");

  const filteredCases = learningCases.filter((c) => {
    const matchType = filterType === "all" || c.typeId === filterType;
    const matchSearch = searchText === "" || c.title.includes(searchText) || c.citizenStatement.includes(searchText);
    return matchType && matchSearch;
  });

  if (selectedCase) {
    return <CaseDetail case_={selectedCase} onBack={() => setSelectedCase(null)} />;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <span>📚</span> 사례로 배우기
        </h1>
        <p className="text-slate-500 text-sm mt-1">상황별 좋은 응대법을 사례로 배워보세요.</p>
      </div>

      {/* Search */}
      <input
        type="text"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        placeholder="🔍 사례 검색..."
        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 mb-4"
      />

      {/* Filter by type */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        <button
          onClick={() => setFilterType("all")}
          className={`flex-shrink-0 text-sm px-3 py-1.5 rounded-full border transition-colors ${
            filterType === "all"
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          전체
        </button>
        {complaintTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setFilterType(type.id)}
            className={`flex-shrink-0 text-sm px-3 py-1.5 rounded-full border transition-colors ${
              filterType === type.id
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {type.icon} {type.title}
          </button>
        ))}
      </div>

      {/* Case List */}
      <div className="space-y-3">
        {filteredCases.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <p className="text-4xl mb-3">📭</p>
            <p>검색 결과가 없습니다.</p>
          </div>
        ) : (
          filteredCases.map((c, index) => {
            const type = complaintTypes.find((t) => t.id === c.typeId);
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCase(c)}
                className="w-full bg-white border border-slate-200 rounded-xl p-4 text-left hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm leading-snug">{c.title}</p>
                    <p className="text-slate-400 text-xs mt-1 truncate">
                      "{c.citizenStatement}"
                    </p>
                    {type && (
                      <span className="inline-block text-xs text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full mt-2">
                        {type.icon} {type.title}
                      </span>
                    )}
                  </div>
                  <span className="text-slate-300 flex-shrink-0">›</span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

function CaseDetail({ case_, onBack }: { case_: LearningCase; onBack: () => void }) {
  const type = complaintTypes.find((t) => t.id === case_.typeId);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 animate-fadeIn">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-blue-600 text-sm font-medium hover:text-blue-800 mb-6"
      >
        ← 목록으로
      </button>

      {/* Title */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800 leading-snug">{case_.title}</h1>
        {type && (
          <span className="inline-block text-xs text-teal-600 bg-teal-50 px-2 py-1 rounded-full mt-2">
            {type.icon} {type.title}
          </span>
        )}
      </div>

      {/* Citizen Statement */}
      <div className="bg-slate-100 rounded-xl p-4 mb-4">
        <p className="text-xs font-semibold text-slate-500 mb-2">👤 민원인 발언</p>
        <p className="text-slate-700 leading-relaxed">"{case_.citizenStatement}"</p>
      </div>

      {/* Bad Response */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
        <p className="text-xs font-semibold text-red-600 mb-2">🚫 흔히 하기 쉬운 부적절한 응대</p>
        <p className="text-red-700 leading-relaxed">"{case_.badResponse}"</p>
        <p className="text-red-500 text-xs mt-2">⟶ {case_.badResponseReason}</p>
      </div>

      {/* Good Response */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
        <p className="text-xs font-semibold text-blue-600 mb-2">✅ 추천 응대 표현</p>
        <p className="text-blue-800 font-medium leading-relaxed">"{case_.goodResponse}"</p>
      </div>

      {/* Explanation */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4">
        <p className="text-xs font-semibold text-slate-500 mb-2">💡 왜 이렇게 말해야 하나요?</p>
        <p className="text-slate-700 text-sm leading-relaxed">{case_.explanation}</p>
      </div>

      {/* Key Expressions */}
      <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-4">
        <p className="text-xs font-semibold text-teal-700 mb-2">🔑 핵심 표현 3가지</p>
        <ol className="space-y-2">
          {case_.keyExpressions.map((expr, i) => (
            <li key={i} className="text-teal-800 text-sm flex items-start gap-2">
              <span className="font-bold text-teal-500 flex-shrink-0">{i + 1}.</span>
              <span>"{expr}"</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Learning Points */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
        <p className="text-xs font-semibold text-slate-600 mb-2">📝 학습 포인트</p>
        <ul className="space-y-1.5">
          {case_.learningPoints.map((point, i) => (
            <li key={i} className="text-slate-700 text-sm flex items-start gap-2">
              <span className="text-blue-500 flex-shrink-0 mt-0.5">✓</span>
              {point}
            </li>
          ))}
        </ul>
      </div>

      {/* Practice Link */}
      <Link
        href={`/practice?typeId=${case_.typeId}`}
        className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white py-4 rounded-xl font-semibold text-center flex items-center justify-center gap-2 hover:from-teal-700 hover:to-teal-800 transition-all"
      >
        <span>🎙️</span> AI 역할극으로 연습하기
      </Link>
    </div>
  );
}
