import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { complaintTypeMap } from "@/data/complaintTypes";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "AI 피드백 서비스가 연결되지 않았습니다." },
      { status: 503 }
    );
  }

  const { typeId, difficulty, messages } = await request.json();
  const complaintType = complaintTypeMap[typeId];

  if (!complaintType) {
    return NextResponse.json({ error: "유효하지 않은 민원 유형입니다." }, { status: 400 });
  }

  const officialMessages = messages
    .filter((m: { role: string }) => m.role === "official")
    .map((m: { content: string }) => m.content)
    .join("\n");

  const conversationText = messages
    .map((m: { role: string; content: string }) =>
      `[${m.role === "official" ? "담당자" : "민원인"}]: ${m.content}`
    )
    .join("\n");

  const prompt = `당신은 공무원 민원 응대 훈련 평가 전문가입니다.

민원 유형: ${complaintType.title}
난이도: ${difficulty}

대화 내역:
${conversationText}

담당자의 응대를 평가해 주세요.

평가 규칙:
- 실제 대화의 구체적인 문장을 근거로 평가합니다.
- 말하지 않은 내용을 추측해서 점수를 매기지 않습니다.
- 상대방의 무리한 요구를 거절한 것을 감점 이유로 삼지 않습니다.
- 안전을 위해 대화를 중단하고 도움을 요청하는 행동을 긍정적으로 평가합니다.
- 점수는 학습용 참고 지표입니다.

반드시 다음 JSON 형식으로만 응답하세요:
{
  "totalScore": 숫자(0-100),
  "scores": {
    "empathy": 숫자(0-20),
    "clarity": 숫자(0-20),
    "composure": 숫자(0-20),
    "principle": 숫자(0-20),
    "protection": 숫자(0-20)
  },
  "strengths": ["잘한 점1", "잘한 점2", "잘한 점3"],
  "improvements": ["개선할 점1", "개선할 점2", "개선할 점3"],
  "goodExpressions": ["좋은 표현 예시"],
  "betterExpressions": ["수정하면 더 좋은 표현"],
  "modelResponse": "이 상황에 가장 적합한 모범 응대 한 문장",
  "keySentence": "이번 훈련의 핵심 한 문장 (20자 이내)"
}`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type");

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("JSON 파싱 실패");

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate and sanitize
    const totalScore = Math.min(100, Math.max(0, Number(parsed.totalScore) || 0));
    const scores = {
      empathy: Math.min(20, Math.max(0, Number(parsed.scores?.empathy) || 0)),
      clarity: Math.min(20, Math.max(0, Number(parsed.scores?.clarity) || 0)),
      composure: Math.min(20, Math.max(0, Number(parsed.scores?.composure) || 0)),
      principle: Math.min(20, Math.max(0, Number(parsed.scores?.principle) || 0)),
      protection: Math.min(20, Math.max(0, Number(parsed.scores?.protection) || 0)),
    };

    return NextResponse.json({
      totalScore,
      scores,
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 3) : [],
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements.slice(0, 3) : [],
      goodExpressions: Array.isArray(parsed.goodExpressions) ? parsed.goodExpressions.slice(0, 3) : [],
      betterExpressions: Array.isArray(parsed.betterExpressions) ? parsed.betterExpressions.slice(0, 3) : [],
      modelResponse: parsed.modelResponse || "",
      keySentence: parsed.keySentence || "",
    });
  } catch (err) {
    console.error("Feedback API error:", err);
    return NextResponse.json(
      { error: "피드백 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}
