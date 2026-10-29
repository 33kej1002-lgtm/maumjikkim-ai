"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { complaintTypes } from "@/data/complaintTypes";

interface Message {
  role: "citizen" | "official";
  content: string;
  timestamp: Date;
}

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/_{1,2}(.+?)_{1,2}/g, "$1")
    .replace(/\[([^\]]+)\]/g, "$1")
    .replace(/#{1,6}\s/g, "")
    .replace(/`(.+?)`/g, "$1")
    .trim();
}

type Difficulty = "beginner" | "intermediate" | "advanced";
type Mode = "text" | "voice";

interface FeedbackData {
  totalScore: number;
  scores: {
    empathy: number;
    clarity: number;
    composure: number;
    principle: number;
    protection: number;
  };
  strengths: string[];
  improvements: string[];
  goodExpressions: string[];
  betterExpressions: string[];
  modelResponse: string;
  keySentence: string;
}

function PracticeContent() {
  const searchParams = useSearchParams();
  const presetTypeId = searchParams.get("typeId");

  const [step, setStep] = useState<"setup" | "chat" | "feedback">("setup");
  const [selectedTypeId, setSelectedTypeId] = useState(presetTypeId || "");
  const [difficulty, setDifficulty] = useState<Difficulty>("beginner");
  const [mode, setMode] = useState<Mode>("text");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turnCount, setTurnCount] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [speechSupported, setSpeechSupported] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  const MAX_TURNS = 5;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const w = window as Window & {
        SpeechRecognition?: typeof SpeechRecognition;
        webkitSpeechRecognition?: typeof SpeechRecognition;
      };
      const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
      if (!SR) setSpeechSupported(false);
      synthRef.current = window.speechSynthesis || null;
    }
  }, []);

  const speakText = (text: string) => {
    if (!voiceEnabled || !synthRef.current) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ko-KR";
    utterance.rate = 1.0;
    synthRef.current.speak(utterance);
  };

  const startRecording = () => {
    const w = window as Window & {
      SpeechRecognition?: typeof SpeechRecognition;
      webkitSpeechRecognition?: typeof SpeechRecognition;
    };
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) return;
    const recognition = new SR();
    recognition.lang = "ko-KR";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setRecognizedText(transcript);
    };
    recognition.onerror = () => {
      setIsRecording(false);
      setError("음성 인식에 실패했습니다. 다시 시도해 주세요.");
    };
    recognition.onend = () => setIsRecording(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
    setRecognizedText("");
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  };

  const startPractice = async () => {
    if (!selectedTypeId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start",
          typeId: selectedTypeId,
          difficulty,
          messages: [],
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "AI 연결에 실패했습니다.");
      }
      const data = await res.json();
      const firstMessage: Message = {
        role: "citizen",
        content: stripMarkdown(data.message),
        timestamp: new Date(),
      };
      setMessages([firstMessage]);
      setStep("chat");
      setTurnCount(1);
      if (mode === "voice") speakText(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI 연결에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const officialMessage: Message = {
      role: "official",
      content: text,
      timestamp: new Date(),
    };
    const newMessages = [...messages, officialMessage];
    setMessages(newMessages);
    setInputText("");
    setRecognizedText("");
    setIsLoading(true);
    setError(null);

    const newTurnCount = turnCount + 1;

    if (newTurnCount >= MAX_TURNS) {
      await getFeedback(newMessages);
      return;
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "continue",
          typeId: selectedTypeId,
          difficulty,
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "AI 응답 생성에 실패했습니다.");
      }
      const data = await res.json();
      const citizenMessage: Message = {
        role: "citizen",
        content: stripMarkdown(data.message),
        timestamp: new Date(),
      };
      setMessages([...newMessages, citizenMessage]);
      setTurnCount(newTurnCount);
      if (mode === "voice") speakText(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const getFeedback = async (chatMessages: Message[]) => {
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          typeId: selectedTypeId,
          difficulty,
          messages: chatMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "피드백 생성에 실패했습니다.");
      }
      const data = await res.json();
      setFeedback(data);
      setStep("feedback");
    } catch (err) {
      setError(err instanceof Error ? err.message : "피드백 생성 오류");
      setStep("feedback");
    } finally {
      setIsLoading(false);
    }
  };

  const resetPractice = () => {
    setStep("setup");
    setMessages([]);
    setFeedback(null);
    setTurnCount(0);
    setError(null);
    setInputText("");
    setRecognizedText("");
    synthRef.current?.cancel();
  };

  const selectedType = complaintTypes.find((t) => t.id === selectedTypeId);

  // Setup Screen
  if (step === "setup") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <span>🎙️</span> AI 민원인과 연습
          </h1>
          <p className="text-slate-500 text-sm mt-1">실전처럼 민원 응대를 연습해 보세요. (교육용 가상 사례)</p>
        </div>

        {/* Type Selection */}
        <div className="mb-5">
          <p className="font-semibold text-slate-700 mb-3 text-sm">1. 민원 유형 선택</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {complaintTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedTypeId(type.id)}
                className={`border rounded-xl p-3 text-left transition-all active:scale-95 ${
                  selectedTypeId === type.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 bg-white hover:border-blue-300"
                }`}
              >
                <div className="text-2xl mb-1">{type.icon}</div>
                <div className={`font-medium text-sm ${selectedTypeId === type.id ? "text-blue-700" : "text-slate-700"}`}>
                  {type.title}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div className="mb-5">
          <p className="font-semibold text-slate-700 mb-3 text-sm">2. 훈련 난이도</p>
          <div className="grid grid-cols-3 gap-2">
            {([
              { value: "beginner", label: "초급", desc: "차분한 민원인", color: "green" },
              { value: "intermediate", label: "중급", desc: "강한 불만 표현", color: "yellow" },
              { value: "advanced", label: "고급", desc: "복합 상황", color: "red" },
            ] as const).map((d) => (
              <button
                key={d.value}
                onClick={() => setDifficulty(d.value)}
                className={`border rounded-xl p-3 text-center transition-all ${
                  difficulty === d.value
                    ? `border-${d.color}-500 bg-${d.color}-50`
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className={`font-bold text-sm ${difficulty === d.value ? `text-${d.color}-700` : "text-slate-700"}`}>
                  {d.label}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{d.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Mode */}
        <div className="mb-6">
          <p className="font-semibold text-slate-700 mb-3 text-sm">3. 대화 방식</p>
          <div className="grid grid-cols-2 gap-2">
            {([
              { value: "text", label: "텍스트 연습", icon: "💬", desc: "타이핑으로 응대" },
              { value: "voice", label: "음성 연습", icon: "🎙️", desc: "말하기로 응대" },
            ] as const).map((m) => (
              <button
                key={m.value}
                onClick={() => setMode(m.value)}
                disabled={m.value === "voice" && !speechSupported}
                className={`border rounded-xl p-4 text-left transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                  mode === m.value
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 bg-white hover:border-blue-300"
                }`}
              >
                <div className="text-2xl mb-1">{m.icon}</div>
                <div className={`font-medium text-sm ${mode === m.value ? "text-blue-700" : "text-slate-700"}`}>
                  {m.label}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {m.value === "voice" && !speechSupported
                    ? "이 브라우저에서 지원 안 됨"
                    : m.desc}
                </div>
              </button>
            ))}
          </div>
          {mode === "voice" && (
            <p className="text-xs text-slate-400 mt-2">
              ℹ️ 음성 인식은 브라우저의 Web Speech API를 사용합니다. 마이크 권한이 필요합니다.
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
            <p className="text-red-600 text-sm">❌ {error}</p>
          </div>
        )}

        <button
          onClick={startPractice}
          disabled={!selectedTypeId || isLoading}
          className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white py-4 rounded-xl font-bold text-lg hover:from-teal-700 hover:to-teal-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <span className="animate-pulse-soft">연습 시작 중...</span>
          ) : (
            <>🎯 연습 시작</>
          )}
        </button>
        <p className="text-center text-xs text-slate-400 mt-3">
          기본 5턴 연습 후 AI 피드백을 제공합니다.
        </p>
      </div>
    );
  }

  // Chat Screen
  if (step === "chat") {
    return (
      <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
        {/* Chat Header */}
        <div className="px-4 py-3 bg-white border-b border-slate-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">{selectedType?.icon}</span>
            <div>
              <p className="font-semibold text-slate-800 text-sm">{selectedType?.title}</p>
              <p className="text-xs text-slate-400">
                {difficulty === "beginner" ? "초급" : difficulty === "intermediate" ? "중급" : "고급"} ·{" "}
                {turnCount}/{MAX_TURNS}턴
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {mode === "voice" && (
              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className="text-xs text-slate-500 border border-slate-200 px-2 py-1 rounded-lg"
              >
                {voiceEnabled ? "🔊" : "🔇"}
              </button>
            )}
            <button
              onClick={() => getFeedback(messages)}
              disabled={isLoading}
              className="text-xs text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50"
            >
              종료 후 피드백
            </button>
            <button
              onClick={resetPractice}
              className="text-xs text-slate-500 border border-slate-200 px-2 py-1 rounded-lg hover:bg-slate-50"
            >
              처음으로
            </button>
          </div>
        </div>

        <div className="bg-amber-50 px-4 py-2 text-xs text-amber-700 flex-shrink-0">
          📌 교육용 가상 시나리오입니다. AI 민원인이 실제 민원 상황을 시뮬레이션합니다.
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-slate-50">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "official" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "official"
                  ? "bg-blue-600 text-white rounded-br-sm"
                  : "bg-white text-slate-800 border border-slate-200 rounded-bl-sm shadow-sm"
              }`}>
                {msg.role === "citizen" && (
                  <p className="text-xs text-slate-400 mb-1 font-medium">👤 AI 민원인</p>
                )}
                {msg.role === "official" && (
                  <p className="text-xs text-blue-200 mb-1 font-medium text-right">나 (담당자)</p>
                )}
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                <p className="text-xs text-slate-400 mb-1">👤 AI 민원인</p>
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{animationDelay: "0ms"}}></span>
                  <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{animationDelay: "150ms"}}></span>
                  <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{animationDelay: "300ms"}}></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Error */}
        {error && (
          <div className="px-4 py-2 bg-red-50 border-t border-red-200 flex-shrink-0">
            <p className="text-red-600 text-xs">❌ {error}</p>
          </div>
        )}

        {/* Voice recognized text */}
        {recognizedText && (
          <div className="px-4 py-2 bg-blue-50 border-t border-blue-200 flex-shrink-0">
            <p className="text-xs text-blue-600 mb-1">인식된 내용 (수정 후 전송):</p>
            <input
              type="text"
              value={recognizedText}
              onChange={(e) => setRecognizedText(e.target.value)}
              className="w-full text-sm border border-blue-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => sendMessage(recognizedText)}
                className="flex-1 bg-blue-600 text-white text-sm py-2 rounded-lg font-medium"
              >
                전송
              </button>
              <button
                onClick={() => setRecognizedText("")}
                className="px-4 text-slate-500 text-sm py-2 rounded-lg border border-slate-200"
              >
                취소
              </button>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="px-4 py-3 bg-white border-t border-slate-200 flex-shrink-0">
          {mode === "text" ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(inputText);
                  }
                }}
                placeholder="응대 멘트를 입력하세요..."
                disabled={isLoading}
                className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 disabled:opacity-50"
              />
              <button
                onClick={() => sendMessage(inputText)}
                disabled={!inputText.trim() || isLoading}
                className="bg-blue-600 text-white px-5 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                전송
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              {!recognizedText && (
                <>
                  <button
                    onMouseDown={startRecording}
                    onMouseUp={stopRecording}
                    onTouchStart={startRecording}
                    onTouchEnd={stopRecording}
                    disabled={isLoading}
                    className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold transition-all ${
                      isRecording
                        ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-200"
                        : "bg-blue-600 text-white hover:bg-blue-700 shadow-md"
                    }`}
                  >
                    {isRecording ? "⏹" : "🎙️"}
                  </button>
                  <p className="text-xs text-slate-500">
                    {isRecording ? "말씀하세요... (손을 떼면 완료)" : "버튼을 누르고 말하세요"}
                  </p>
                  <button
                    onClick={() => setMode("text")}
                    className="text-xs text-blue-600 underline"
                  >
                    텍스트로 전환
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Feedback Screen
  if (step === "feedback") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 animate-fadeIn">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">📊 연습 피드백</h1>
        <p className="text-slate-500 text-sm mb-6">
          {selectedType?.title} 연습 결과입니다.
        </p>

        {!feedback ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600 mb-2">AI 피드백을 불러오지 못했습니다.</p>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <p className="text-slate-600 text-sm">아래에서 대화 내역을 직접 확인하세요.</p>
          </div>
        ) : (
          <FeedbackDisplay feedback={feedback} />
        )}

        {/* Chat history */}
        <div className="mt-6">
          <p className="font-semibold text-slate-700 text-sm mb-3">💬 대화 내역</p>
          <div className="space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`rounded-xl p-3 text-sm ${
                msg.role === "official"
                  ? "bg-blue-50 border border-blue-200"
                  : "bg-slate-50 border border-slate-200"
              }`}>
                <p className={`text-xs font-medium mb-1 ${msg.role === "official" ? "text-blue-600" : "text-slate-500"}`}>
                  {msg.role === "official" ? "나 (담당자)" : "AI 민원인"}
                </p>
                <p className={msg.role === "official" ? "text-blue-800" : "text-slate-700"}>
                  {msg.content}
                </p>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={resetPractice}
          className="w-full mt-6 bg-gradient-to-r from-teal-600 to-teal-700 text-white py-4 rounded-xl font-bold text-lg hover:from-teal-700 hover:to-teal-800 transition-all"
        >
          🔄 다시 연습하기
        </button>
      </div>
    );
  }

  return null;
}

function FeedbackDisplay({ feedback }: { feedback: FeedbackData }) {
  const scoreItems = [
    { key: "empathy", label: "공감과 경청", score: feedback.scores.empathy },
    { key: "clarity", label: "설명의 명확성", score: feedback.scores.clarity },
    { key: "composure", label: "침착함과 표현", score: feedback.scores.composure },
    { key: "principle", label: "원칙 준수 및 대안", score: feedback.scores.principle },
    { key: "protection", label: "직원 보호 대응", score: feedback.scores.protection },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 16) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 12) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const totalColor = feedback.totalScore >= 80
    ? "from-green-500 to-teal-500"
    : feedback.totalScore >= 60
    ? "from-yellow-500 to-orange-500"
    : "from-red-500 to-pink-500";

  return (
    <div className="space-y-4">
      {/* Total Score */}
      <div className={`bg-gradient-to-r ${totalColor} rounded-2xl p-6 text-center text-white`}>
        <p className="text-sm font-medium mb-1 opacity-80">총점</p>
        <p className="text-6xl font-bold">{feedback.totalScore}</p>
        <p className="text-sm opacity-80 mt-1">/ 100점</p>
      </div>

      {/* Score breakdown */}
      <div className="grid grid-cols-1 gap-2">
        {scoreItems.map((item) => (
          <div key={item.key} className={`border rounded-xl p-3 flex items-center justify-between ${getScoreColor(item.score)}`}>
            <span className="font-medium text-sm">{item.label}</span>
            <span className="font-bold">{item.score}/20</span>
          </div>
        ))}
      </div>

      {/* Strengths */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <p className="font-semibold text-green-700 mb-2 text-sm">✅ 잘한 점</p>
        <ul className="space-y-1.5">
          {feedback.strengths.map((s, i) => (
            <li key={i} className="text-green-800 text-sm flex items-start gap-2">
              <span className="text-green-500 flex-shrink-0">✓</span> {s}
            </li>
          ))}
        </ul>
      </div>

      {/* Improvements */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
        <p className="font-semibold text-orange-700 mb-2 text-sm">💡 개선할 점</p>
        <ul className="space-y-1.5">
          {feedback.improvements.map((s, i) => (
            <li key={i} className="text-orange-800 text-sm flex items-start gap-2">
              <span className="text-orange-500 flex-shrink-0">→</span> {s}
            </li>
          ))}
        </ul>
      </div>

      {/* Good expressions */}
      {feedback.goodExpressions.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="font-semibold text-blue-700 mb-2 text-sm">👍 좋은 표현</p>
          {feedback.goodExpressions.map((e, i) => (
            <p key={i} className="text-blue-800 text-sm mb-1">"{e}"</p>
          ))}
        </div>
      )}

      {/* Better expressions */}
      {feedback.betterExpressions.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <p className="font-semibold text-slate-700 mb-2 text-sm">✏️ 수정하면 더 좋은 표현</p>
          {feedback.betterExpressions.map((e, i) => (
            <p key={i} className="text-slate-700 text-sm mb-1">"{e}"</p>
          ))}
        </div>
      )}

      {/* Model response */}
      <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
        <p className="font-semibold text-teal-700 mb-2 text-sm">📌 모범 응대 예시</p>
        <p className="text-teal-800 text-sm leading-relaxed">"{feedback.modelResponse}"</p>
      </div>

      {/* Key sentence */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 text-white text-center">
        <p className="text-xs font-medium mb-2 opacity-80">이번 훈련의 핵심</p>
        <p className="font-bold text-base leading-snug">{feedback.keySentence}</p>
      </div>

      <p className="text-xs text-slate-400 text-center">
        ⚠️ 이 점수는 학습용 참고 지표로만 사용하며 공식 평가나 인사와 무관합니다.
      </p>
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-slate-400">로딩 중...</div>}>
      <PracticeContent />
    </Suspense>
  );
}
