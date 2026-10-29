"use client";

import { useState } from "react";
import { complaintTypes, ComplaintType, DefaultResponse } from "@/data/complaintTypes";

interface AIResponse {
  immediate: string;
  empathy: string;
  principle: string;
  alternative: string;
  avoid: string[];
  warning?: string;
}

export default function ImmediatePage() {
  const [selectedType, setSelectedType] = useState<ComplaintType | null>(null);
  const [situationText, setSituationText] = useState("");
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<"normal" | "large">("normal");

  const handleSelectType = (type: ComplaintType) => {
    setSelectedType(type);
    setAiResponse(null);
    setError(null);
    setSituationText("");
  };

  const handleGenerateAI = async () => {
    if (!selectedType) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          typeId: selectedType.id,
          typeTitle: selectedType.title,
          situation: situationText,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "AI 응답 생성에 실패했습니다.");
      }
      const data = await res.json();
      setAiResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const displayResponse: DefaultResponse | AIResponse | null = aiResponse || selectedType?.defaultResponse || null;
  const textClass = fontSize === "large" ? "text-lg" : "text-base";

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <span>⚡</span> 지금 바로 응대
        </h1>
        <p className="text-slate-500 text-sm mt-1">민원 유형을 선택하면 즉시 응대 멘트를 확인할 수 있습니다.</p>
      </div>

      {/* Complaint Type Selection */}
      {!selectedType ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {complaintTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => handleSelectType(type)}
              className={`bg-white border rounded-xl p-4 text-left hover:border-blue-400 hover:shadow-md transition-all active:scale-95 ${
                type.isHighRisk ? "border-red-200 hover:border-red-400" : "border-slate-200"
              }`}
            >
              <div className="text-3xl mb-2">{type.icon}</div>
              <div className={`font-semibold text-sm ${type.isHighRisk ? "text-red-700" : "text-slate-800"}`}>
                {type.title}
              </div>
              {type.isHighRisk && (
                <div className="text-xs text-red-500 mt-1">⚠️ 위험</div>
              )}
            </button>
          ))}
        </div>
      ) : (
        <div className="animate-fadeIn space-y-4">
          {/* Back + Type Header */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedType(null)}
              className="flex items-center gap-1 text-blue-600 text-sm font-medium hover:text-blue-800"
            >
              ← 유형 다시 선택
            </button>
            <button
              onClick={() => setFontSize(fontSize === "normal" ? "large" : "normal")}
              className="text-xs text-slate-500 border border-slate-200 px-2 py-1 rounded-lg hover:bg-slate-50"
            >
              {fontSize === "normal" ? "가 크게" : "가 보통"}
            </button>
          </div>

          {/* Type Badge */}
          <div className={`flex items-center gap-2 p-3 rounded-xl ${selectedType.isHighRisk ? "bg-red-50 border border-red-200" : "bg-blue-50 border border-blue-200"}`}>
            <span className="text-2xl">{selectedType.icon}</span>
            <div>
              <div className={`font-bold ${selectedType.isHighRisk ? "text-red-700" : "text-blue-700"}`}>{selectedType.title}</div>
              <div className="text-xs text-slate-500">{selectedType.description}</div>
            </div>
          </div>

          {/* Warning for high risk */}
          {selectedType.isHighRisk && selectedType.defaultResponse.warning && (
            <div className="bg-red-50 border border-red-300 rounded-xl p-4">
              <p className={`text-red-700 font-semibold ${textClass}`}>{selectedType.defaultResponse.warning}</p>
            </div>
          )}

          {/* Default Response */}
          {displayResponse && (
            <div className="space-y-3">
              <ResponseCard
                label="💬 지금 바로 말할 한 문장"
                text={displayResponse.immediate}
                textClass={textClass}
                onCopy={() => handleCopy(displayResponse.immediate, "immediate")}
                copied={copied === "immediate"}
                highlight
              />
              <ResponseCard
                label="🤝 공감 및 사실 확인 표현"
                text={displayResponse.empathy}
                textClass={textClass}
                onCopy={() => handleCopy(displayResponse.empathy, "empathy")}
                copied={copied === "empathy"}
              />
              <ResponseCard
                label="📋 처리 원칙 설명 표현"
                text={displayResponse.principle}
                textClass={textClass}
                onCopy={() => handleCopy(displayResponse.principle, "principle")}
                copied={copied === "principle"}
              />
              <ResponseCard
                label="🔀 대안 또는 다음 단계"
                text={displayResponse.alternative}
                textClass={textClass}
                onCopy={() => handleCopy(displayResponse.alternative, "alternative")}
                copied={copied === "alternative"}
              />

              {/* Avoid expressions */}
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <p className="font-semibold text-orange-800 text-sm mb-2">🚫 피해야 할 표현</p>
                <ul className="space-y-1">
                  {displayResponse.avoid.map((expr, i) => (
                    <li key={i} className={`text-orange-700 ${textClass} flex items-start gap-1`}>
                      <span className="text-orange-400 mt-1">✗</span> {expr}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* AI Enhancement */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <p className="font-semibold text-slate-700 text-sm">🤖 AI 맞춤 응대 생성 (선택)</p>
            <textarea
              value={situationText}
              onChange={(e) => setSituationText(e.target.value)}
              placeholder="상황을 더 구체적으로 입력하면 맞춤 응대 문장을 생성합니다.&#10;예: 민원인이 30분째 계속 같은 말을 반복하며 소리를 지르고 있습니다."
              className="w-full border border-slate-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-blue-400 bg-white"
              rows={3}
            />
            <button
              onClick={handleGenerateAI}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="animate-pulse-soft">AI 생성 중...</span>
                </>
              ) : (
                <>
                  <span>✨</span> AI 맞춤 응대 생성
                </>
              )}
            </button>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">❌ {error}</p>
                <p className="text-red-500 text-xs mt-1">위의 기본 응대 멘트를 사용하세요.</p>
              </div>
            )}
            {aiResponse && (
              <p className="text-xs text-teal-600 text-center">✅ AI가 맞춤 응대 문장을 생성했습니다.</p>
            )}
          </div>

          {aiResponse && (
            <button
              onClick={() => setAiResponse(null)}
              className="w-full text-slate-500 text-sm py-2 border border-slate-200 rounded-xl hover:bg-slate-50"
            >
              기본 응대 멘트로 돌아가기
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ResponseCard({
  label,
  text,
  textClass,
  onCopy,
  copied,
  highlight,
}: {
  label: string;
  text: string;
  textClass: string;
  onCopy: () => void;
  copied: boolean;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-xl p-4 border ${highlight ? "bg-blue-50 border-blue-200" : "bg-white border-slate-200"}`}>
      <div className="flex items-center justify-between mb-2">
        <p className={`font-semibold text-sm ${highlight ? "text-blue-700" : "text-slate-600"}`}>{label}</p>
        <button
          onClick={onCopy}
          className="text-xs text-slate-400 hover:text-blue-600 border border-slate-200 px-2 py-1 rounded-lg"
        >
          {copied ? "✅ 복사됨" : "📋 복사"}
        </button>
      </div>
      <p className={`${textClass} ${highlight ? "text-blue-900 font-medium" : "text-slate-700"} leading-relaxed`}>
        "{text}"
      </p>
    </div>
  );
}
