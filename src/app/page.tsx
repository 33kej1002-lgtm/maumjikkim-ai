import Link from "next/link";

const menuItems = [
  {
    href: "/immediate",
    icon: "⚡",
    title: "지금 바로 응대",
    description: "급할 때 바로 찾는 민원 응대 멘트",
    color: "from-blue-600 to-blue-700",
    bgHover: "hover:shadow-blue-100",
  },
  {
    href: "/practice",
    icon: "🎙️",
    title: "AI 민원인과 연습",
    description: "텍스트·음성으로 실전처럼 연습하기",
    color: "from-teal-600 to-teal-700",
    bgHover: "hover:shadow-teal-100",
  },
  {
    href: "/learn",
    icon: "📚",
    title: "사례로 배우기",
    description: "하루 3분, 상황별 좋은 응대법 배우기",
    color: "from-indigo-600 to-indigo-700",
    bgHover: "hover:shadow-indigo-100",
  },
  {
    href: "/wellness",
    icon: "💚",
    title: "내 마음 지키기",
    description: "힘든 민원 이후 감정 회복과 보호 방법",
    color: "from-emerald-600 to-emerald-700",
    bgHover: "hover:shadow-emerald-100",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-teal-600 text-white py-12 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-5xl">🛡️</span>
            <div className="text-left">
              <h1 className="text-3xl font-bold leading-tight">마음지킴 AI</h1>
              <p className="text-blue-100 text-sm mt-1">민원 응대는 똑똑하게, 내 마음은 단단하게</p>
            </div>
          </div>
          <p className="text-blue-50 text-base leading-relaxed mt-6 max-w-md mx-auto">
            오늘도 민원 현장에서 수고하셨습니다.<br />
            상황에 맞는 응대법을 찾거나 AI와 함께 연습해 보세요.
          </p>
        </div>
      </div>

      {/* Main Menu */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`group bg-white rounded-2xl border border-slate-200 p-6 flex items-start gap-4 shadow-sm hover:shadow-lg ${item.bgHover} transition-all duration-200`}
            >
              <div className={`bg-gradient-to-br ${item.color} rounded-xl p-3 text-2xl flex-shrink-0`}>
                {item.icon}
              </div>
              <div>
                <h2 className="font-bold text-slate-800 text-lg leading-tight group-hover:text-blue-700 transition-colors">
                  {item.title}
                </h2>
                <p className="text-slate-500 text-sm mt-1 leading-snug">
                  {item.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Access Banner */}
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <p className="font-semibold text-amber-800 text-sm">지금 당장 민원 응대가 필요하신가요?</p>
            <p className="text-amber-700 text-sm mt-0.5">
              <Link href="/immediate" className="underline font-medium">지금 바로 응대</Link>에서 민원 유형을 선택하면 즉시 멘트를 확인할 수 있습니다.
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center space-y-2">
          <p className="text-xs text-slate-400">
            ⚠️ 이 앱의 AI 응대 제안은 참고용이며, 실제 민원 처리의 법적·행정적 결정을 대신하지 않습니다.
          </p>
          <p className="text-xs text-slate-400">
            개인정보는 수집하지 않으며, 역할극 대화는 교육 목적의 가상 사례입니다.
          </p>
          <p className="text-xs text-slate-300 mt-2">마음지킴 AI v1.0</p>
        </div>
      </div>
    </div>
  );
}
