import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { complaintTypeMap } from "@/data/complaintTypes";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const difficultyDesc = {
  beginner: "비교적 차분하고 협조적인 민원인입니다. 불만이 있지만 대화로 해결하려 합니다.",
  intermediate: "강한 불만을 표현하며 목소리를 높이기도 합니다. 자신의 주장을 강하게 피력합니다.",
  advanced: "반복 질문, 언성 상승, 규정 예외 요구 등이 복합적으로 나타납니다. 설명을 잘 받아들이지 않고 계속 압박합니다.",
};

export async function POST(request: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "AI 서비스가 현재 연결되지 않았습니다. 텍스트 연습을 이용하려면 AI 연결이 필요합니다." },
      { status: 503 }
    );
  }

  const { action, typeId, difficulty, messages } = await request.json();

  const complaintType = complaintTypeMap[typeId];
  if (!complaintType) {
    return NextResponse.json({ error: "유효하지 않은 민원 유형입니다." }, { status: 400 });
  }

  const systemPrompt = `당신은 공무원 민원 응대 훈련을 위한 AI 민원인입니다.

민원 유형: ${complaintType.title} - ${complaintType.description}
난이도: ${difficultyDesc[difficulty as keyof typeof difficultyDesc] || difficultyDesc.beginner}

규칙:
1. 반드시 민원인 역할을 유지하고, AI임을 드러내지 마세요.
2. 공무원의 응대에 따라 태도가 변할 수 있습니다 (좋은 응대 → 진정, 나쁜 응대 → 더 강한 불만).
3. 매번 동일한 문장을 반복하지 마세요.
4. 실제 욕설과 차별적 비하 표현은 사용하지 마세요.
5. 폭력 위협이나 위험 행동을 상세하게 묘사하지 마세요.
6. 공무원이 안전 절차를 밟는 것을 적절한 대응으로 인정하세요.
7. 1~3문장으로 간결하게 말하세요.
8. 한국어로만 말하세요.
9. 이것이 교육용 가상 시나리오임을 인식하고 있지만, 역할극에서는 민원인으로 행동하세요.
10. 절대로 마크다운 문법(**굵게**, *기울임*, ## 헤딩 등)을 사용하지 마세요. 일반 텍스트로만 말하세요.
11. 대괄호 표현([전화벨 소리 후] 같은 지문 형식)도 사용하지 마세요. 바로 대화 내용만 말하세요.`;

  try {
    const apiMessages = action === "start"
      ? [{ role: "user" as const, content: "민원인으로서 첫 번째 발언을 시작해 주세요." }]
      : messages.map((m: { role: string; content: string }) => ({
          role: m.role === "official" ? ("user" as const) : ("assistant" as const),
          content: m.content,
        }));

    const response = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 300,
      system: systemPrompt,
      messages: apiMessages,
    });

    const content = response.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type");

    return NextResponse.json({ message: content.text });
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json(
      { error: "AI 응답 생성에 실패했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 500 }
    );
  }
}
