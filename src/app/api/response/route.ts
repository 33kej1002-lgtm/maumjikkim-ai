import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "AI 서비스가 현재 연결되지 않았습니다. 위의 기본 응대 멘트를 사용하세요." },
      { status: 503 }
    );
  }

  const { typeId, typeTitle, situation } = await request.json();

  if (!typeId || !typeTitle) {
    return NextResponse.json({ error: "민원 유형이 필요합니다." }, { status: 400 });
  }

  const prompt = `당신은 공무원 민원 응대 전문가입니다.
민원 유형: ${typeTitle}
${situation ? `구체적 상황: ${situation}` : ""}

다음 형식의 JSON으로 응대 멘트를 작성해 주세요.
- 모든 표현은 공손하고 단호한 존댓말을 사용합니다.
- 무조건적인 사과나 책임 인정을 하지 않습니다.
- 확인되지 않은 규정, 처리 기한, 권한을 임의로 만들지 않습니다.
- 실제 위협·폭력 상황에서는 직원 안전을 우선시합니다.

반드시 아래 JSON 형식으로만 응답하세요:
{
  "immediate": "지금 바로 말할 한 문장",
  "empathy": "공감 및 사실 확인 표현",
  "principle": "처리 원칙을 설명하는 표현",
  "alternative": "가능한 대안 또는 다음 단계",
  "avoid": ["피해야 할 표현1", "피해야 할 표현2", "피해야 할 표현3"]
}`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 800,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type");

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("JSON 파싱 실패");

    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json(parsed);
  } catch (err) {
    console.error("AI response error:", err);
    return NextResponse.json(
      { error: "AI 응답 생성에 실패했습니다. 기본 멘트를 사용해 주세요." },
      { status: 500 }
    );
  }
}
