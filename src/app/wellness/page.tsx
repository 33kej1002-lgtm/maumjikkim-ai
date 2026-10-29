"use client";

import { useState, useEffect } from "react";

const protectivePhrases = [
  "모든 민원인의 감정을 내가 책임질 필요는 없습니다.",
  "친절함과 부당한 요구의 수용은 다릅니다.",
  "원칙을 지키며 존중받을 권리가 있습니다.",
  "오늘 나는 최선을 다했습니다.",
  "어려운 상황에서도 잘 대응했습니다.",
  "내 감정은 중요하고 소중합니다.",
];

const breathingSteps = [
  { text: "코로 천천히 숨을 들이쉬세요", duration: 4, action: "inhale" },
  { text: "잠시 멈추세요", duration: 2, action: "hold" },
  { text: "입으로 천천히 내쉬세요", duration: 6, action: "exhale" },
  { text: "잠시 쉬세요", duration: 2, action: "rest" },
];

export default function WellnessPage() {
  const [activeSection, setActiveSection] = useState<"main" | "breathing" | "phrases" | "help">("main");
  const [breathingStep, setBreathingStep] = useState(0);
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingRound, setBreathingRound] = useState(0);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [todayPhraseIndex, setTodayPhraseIndex] = useState(0);
  useEffect(() => {
    setTodayPhraseIndex(new Date().getDate() % protectivePhrases.length);
  }, []);

  const startBreathing = () => {
    setBreathingActive(true);
    setBreathingStep(0);
    setBreathingRound(1);
    runBreathing(0, 1);
  };

  const runBreathing = (stepIdx: number, round: number) => {
    if (round > 5) {
      setBreathingActive(false);
      return;
    }
    setBreathingStep(stepIdx);
    setBreathingRound(round);
    const step = breathingSteps[stepIdx];
    setTimeout(() => {
      const nextStep = (stepIdx + 1) % breathingSteps.length;
      const nextRound = nextStep === 0 ? round + 1 : round;
      runBreathing(nextStep, nextRound);
    }, step.duration * 1000);
  };

  const stopBreathing = () => {
    setBreathingActive(false);
  };

  const currentBreathingStep = breathingSteps[breathingStep];

  if (activeSection === "breathing") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <button
          onClick={() => { setActiveSection("main"); stopBreathing(); }}
          className="flex items-center gap-1 text-blue-600 text-sm font-medium hover:text-blue-800 mb-6"
        >
          ← 돌아가기
        </button>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">🌬️ 마음 회복 1분 호흡</h2>
          <p className="text-slate-500 text-sm mb-8">5회 호흡으로 긴장을 풀어보세요.</p>

          {!breathingActive ? (
            <div className="space-y-6">
              <div className="bg-teal-50 border border-teal-200 rounded-2xl p-8">
                <p className="text-teal-700 text-lg leading-relaxed">
                  지금 이 순간,<br />
                  잠깐 멈추고 숨을 고르세요.<br />
                  <br />
                  내 호흡에 집중하는 것만으로도<br />
                  긴장이 풀립니다.
                </p>
              </div>
              <button
                onClick={startBreathing}
                className="bg-teal-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-teal-700 transition-all"
              >
                호흡 시작하기
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className={`rounded-full mx-auto flex items-center justify-center transition-all duration-1000 ${
                currentBreathingStep.action === "inhale"
                  ? "w-48 h-48 bg-teal-100 border-4 border-teal-400"
                  : currentBreathingStep.action === "exhale"
                  ? "w-32 h-32 bg-blue-100 border-4 border-blue-300"
                  : "w-40 h-40 bg-slate-100 border-4 border-slate-300"
              }`}>
                <div className="text-center">
                  <p className="text-4xl mb-2">
                    {currentBreathingStep.action === "inhale" ? "↑" :
                     currentBreathingStep.action === "exhale" ? "↓" : "⏸"}
                  </p>
                  <p className="font-bold text-slate-700">{currentBreathingStep.text}</p>
                  <p className="text-sm text-slate-500">{currentBreathingStep.duration}초</p>
                </div>
              </div>
              <p className="text-slate-500 text-sm">{breathingRound}/5 회</p>
              <button
                onClick={stopBreathing}
                className="text-slate-400 text-sm underline"
              >
                중단하기
              </button>
            </div>
          )}

          {!breathingActive && (
            <div className="mt-8 bg-slate-50 border border-slate-200 rounded-xl p-4 text-left space-y-2">
              <p className="font-semibold text-slate-700 text-sm">다음 업무 전 집중 회복</p>
              <p className="text-slate-500 text-sm">• 물 한 잔 마시기</p>
              <p className="text-slate-500 text-sm">• 어깨와 목을 가볍게 돌리기</p>
              <p className="text-slate-500 text-sm">• 잠깐 창밖을 바라보기</p>
              <p className="text-slate-500 text-sm">• 긍정적인 문장 하나 떠올리기</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (activeSection === "phrases") {
    const phrase = protectivePhrases[phraseIndex];
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <button
          onClick={() => setActiveSection("main")}
          className="flex items-center gap-1 text-blue-600 text-sm font-medium hover:text-blue-800 mb-6"
        >
          ← 돌아가기
        </button>

        <h2 className="text-2xl font-bold text-slate-800 mb-2">💚 나를 지키는 문장</h2>
        <p className="text-slate-500 text-sm mb-8">오늘 나에게 필요한 문장을 찾아보세요.</p>

        <div className="space-y-4">
          {protectivePhrases.map((p, i) => (
            <div
              key={i}
              className={`rounded-2xl p-6 cursor-pointer transition-all ${
                phraseIndex === i
                  ? "bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-lg"
                  : "bg-white border border-slate-200 text-slate-700 hover:border-teal-300"
              }`}
              onClick={() => setPhraseIndex(i)}
            >
              <p className={`text-lg font-medium leading-relaxed ${phraseIndex === i ? "text-white" : "text-slate-700"}`}>
                "{p}"
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-blue-700 text-sm leading-relaxed">
            💙 이 문장들은 민원 응대 전문가들이 공무원의 심리적 안전을 위해 권장하는 자기 인식 문장입니다.
            어려운 하루였다면, 조용히 마음속으로 한 번 되뇌어 보세요.
          </p>
        </div>
      </div>
    );
  }

  if (activeSection === "help") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <button
          onClick={() => setActiveSection("main")}
          className="flex items-center gap-1 text-blue-600 text-sm font-medium hover:text-blue-800 mb-6"
        >
          ← 돌아가기
        </button>

        <h2 className="text-2xl font-bold text-slate-800 mb-2">🆘 도움 요청 안내</h2>
        <p className="text-slate-500 text-sm mb-6">혼자 감당하지 않아도 됩니다.</p>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="font-bold text-blue-700 mb-2">👥 동료·관리자에게 알리기</p>
            <ul className="space-y-1 text-blue-800 text-sm">
              <li>• 힘든 민원 상황을 관리자에게 바로 보고하세요</li>
              <li>• 혼자 대응하기 어려운 민원인은 동료의 도움을 요청하세요</li>
              <li>• 감정적으로 힘든 날은 팀장 또는 동료에게 솔직하게 말하세요</li>
            </ul>
          </div>

          <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
            <p className="font-bold text-teal-700 mb-2">📋 기관 대응 절차 확인</p>
            <ul className="space-y-1 text-teal-800 text-sm">
              <li>• 기관의 특이민원·고충민원 대응 매뉴얼을 확인하세요</li>
              <li>• 블랙리스트 민원인 지정 등 내부 절차를 활용하세요</li>
              <li>• 민원인의 폭언·위협은 기록하고 공식 보고하세요</li>
            </ul>
          </div>

          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4">
            <p className="font-bold text-red-700 mb-2">🚨 위협·폭력 발생 시 즉각 조치</p>
            <ul className="space-y-1 text-red-700 text-sm">
              <li>• <strong>즉시 안전한 장소로 이동하세요</strong></li>
              <li>• 동료에게 도움을 요청하세요</li>
              <li>• 필요시 경찰(112)에 신고하세요</li>
              <li>• 상황을 기록하고 기관에 보고하세요</li>
            </ul>
            <p className="text-red-500 text-xs mt-3">⚠️ 직원 안전이 최우선입니다. 어떤 민원도 직원의 안전보다 중요하지 않습니다.</p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
            <p className="font-bold text-purple-700 mb-2">💜 심리 지원 안내</p>
            <ul className="space-y-1 text-purple-800 text-sm">
              <li>• 공무원 마음건강 지원 서비스를 이용하세요</li>
              <li>• 인사혁신처 또는 기관 복지 부서에 문의하세요</li>
              <li>• 지속적인 감정 소진이 느껴지면 전문 상담을 받으세요</li>
            </ul>
            <p className="text-purple-500 text-xs mt-2">※ 이 앱은 전문 심리 상담 서비스가 아닙니다. 심리적 어려움이 지속되면 전문 기관을 이용하세요.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <span>💚</span> 내 마음 지키기
        </h1>
        <p className="text-slate-500 text-sm mt-1">힘든 민원 이후 나를 돌보는 시간입니다.</p>
      </div>

      {/* Today's phrase */}
      <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-2xl p-6 mb-6">
        <p className="text-sm font-medium opacity-80 mb-2">오늘의 응원 문장</p>
        <p className="text-xl font-bold leading-snug">
          "{protectivePhrases[todayPhraseIndex]}"
        </p>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 gap-4">
        <button
          onClick={() => setActiveSection("breathing")}
          className="bg-white border border-slate-200 rounded-2xl p-5 text-left hover:border-teal-300 hover:shadow-md transition-all flex items-center gap-4"
        >
          <div className="bg-teal-100 rounded-xl p-3 text-2xl flex-shrink-0">🌬️</div>
          <div>
            <p className="font-bold text-slate-800">마음 회복 1분 호흡</p>
            <p className="text-slate-500 text-sm mt-0.5">긴장 완화를 위한 호흡 가이드</p>
          </div>
          <span className="text-slate-300 ml-auto">›</span>
        </button>

        <button
          onClick={() => setActiveSection("phrases")}
          className="bg-white border border-slate-200 rounded-2xl p-5 text-left hover:border-blue-300 hover:shadow-md transition-all flex items-center gap-4"
        >
          <div className="bg-blue-100 rounded-xl p-3 text-2xl flex-shrink-0">💬</div>
          <div>
            <p className="font-bold text-slate-800">나를 지키는 문장</p>
            <p className="text-slate-500 text-sm mt-0.5">나를 위한 긍정적 자기 인식 문장</p>
          </div>
          <span className="text-slate-300 ml-auto">›</span>
        </button>

        <button
          onClick={() => setActiveSection("help")}
          className="bg-white border border-red-200 rounded-2xl p-5 text-left hover:border-red-400 hover:shadow-md transition-all flex items-center gap-4"
        >
          <div className="bg-red-50 rounded-xl p-3 text-2xl flex-shrink-0">🆘</div>
          <div>
            <p className="font-bold text-red-700">도움 요청 안내</p>
            <p className="text-slate-500 text-sm mt-0.5">위험 상황 대응 및 지원 요청 방법</p>
          </div>
          <span className="text-red-300 ml-auto">›</span>
        </button>
      </div>

      {/* Quick check */}
      <div className="mt-6 bg-slate-50 border border-slate-200 rounded-xl p-4">
        <p className="font-semibold text-slate-700 text-sm mb-3">지금 내 상태는 어떤가요?</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { emoji: "😌", label: "괜찮아요" },
            { emoji: "😤", label: "힘들어요" },
            { emoji: "😰", label: "많이 지쳐요" },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => {
                if (item.label !== "괜찮아요") setActiveSection("breathing");
              }}
              className="bg-white border border-slate-200 rounded-xl py-3 flex flex-col items-center gap-1 hover:border-teal-300 hover:shadow-sm transition-all"
            >
              <span className="text-2xl">{item.emoji}</span>
              <span className="text-xs text-slate-600">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
