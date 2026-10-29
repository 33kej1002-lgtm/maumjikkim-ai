export interface DefaultResponse {
  immediate: string;
  empathy: string;
  principle: string;
  alternative: string;
  avoid: string[];
  warning?: string;
}

export interface ComplaintType {
  id: string;
  title: string;
  icon: string;
  description: string;
  defaultResponse: DefaultResponse;
  isHighRisk?: boolean;
}

export const complaintTypes: ComplaintType[] = [
  {
    id: "verbal-abuse",
    title: "폭언·고성",
    icon: "🔊",
    description: "욕설, 고함, 인격 모독적 언행",
    isHighRisk: true,
    defaultResponse: {
      immediate: "말씀하시는 내용은 충분히 이해하겠습니다. 다만 업무를 원활하게 진행하기 위해 차분하게 말씀해 주시면 더 잘 도와드릴 수 있습니다.",
      empathy: "많이 답답하고 불편하신 상황이라는 건 이해합니다. 말씀하시고자 하는 내용을 차분하게 전달해 주시면 최선을 다해 확인해 드리겠습니다.",
      principle: "원활한 민원 처리를 위해 상호 존중하는 대화를 부탁드립니다. 불편한 점이 있으시면 구체적인 내용을 말씀해 주세요.",
      alternative: "지금 바로 처리가 어렵다면 관리자를 연결해 드릴 수도 있습니다. 어떻게 도와드릴까요?",
      avoid: [
        "저도 사람입니다 (감정적 대응)",
        "그러면 도와드릴 수 없습니다 (단절적 표현)",
        "진정하세요 (명령형 표현)",
      ],
      warning: "⚠️ 폭언이 지속되면 관리자에게 즉시 보고하고, 필요시 기관의 비상 대응 절차를 따르세요. 직원 안전이 최우선입니다.",
    },
  },
  {
    id: "impossible-request",
    title: "처리 불가 항의",
    icon: "🚫",
    description: "규정상 처리가 불가능한 요청에 대한 강한 항의",
    defaultResponse: {
      immediate: "요청하신 사항에 대해 현재 적용되는 처리 기준을 확인해 드리겠습니다. 잠시 기다려 주시겠습니까?",
      empathy: "원하시는 결과가 나오지 않아 실망하셨을 것 같습니다. 충분히 이해합니다.",
      principle: "현재 관련 규정에 따르면 이 부분은 처리가 어렵습니다. 정확한 내용을 확인한 후 가능한 방법을 안내해 드리겠습니다.",
      alternative: "담당 부서에 문의하거나 이의 신청 절차를 안내해 드릴 수 있습니다. 어떻게 진행하시겠습니까?",
      avoid: [
        "규정이니까 어쩔 수 없습니다 (무책임한 표현)",
        "저는 모릅니다 (회피)",
        "다른 곳에 물어보세요 (책임 전가)",
      ],
    },
  },
  {
    id: "waiting-complaint",
    title: "장시간 대기 불만",
    icon: "⏰",
    description: "오래 기다렸다는 불만과 항의",
    defaultResponse: {
      immediate: "오래 기다리셨습니다. 불편을 드려서 죄송합니다. 지금 바로 처리해 드리겠습니다.",
      empathy: "오랜 시간 기다리셔서 많이 불편하셨겠습니다. 충분히 이해합니다.",
      principle: "현재 많은 분들이 대기 중이어서 처리 시간이 길어지고 있습니다. 가능한 한 빠르게 처리해 드리겠습니다.",
      alternative: "미리 예약하시거나 온라인으로 신청하시면 대기 시간을 줄이실 수 있습니다. 안내해 드릴까요?",
      avoid: [
        "저도 바쁩니다 (공감 부족)",
        "다음에 일찍 오세요 (비공감적 조언)",
        "어쩔 수 없어요 (무책임한 표현)",
      ],
    },
  },
  {
    id: "repeated-complaint",
    title: "반복·동일 민원",
    icon: "🔄",
    description: "같은 내용을 반복해서 요구하는 경우",
    defaultResponse: {
      immediate: "이전에 말씀드린 내용과 동일하게, 현재 상황에서 제공 가능한 사항을 다시 한번 안내해 드리겠습니다.",
      empathy: "같은 내용을 여러 번 말씀드려야 하는 상황이 답답하게 느껴지실 수 있다는 점 이해합니다.",
      principle: "관련 규정에 따른 처리 결과는 이전과 동일합니다. 변경된 사항이 있으시거나 추가 확인이 필요하신 부분이 있으시면 말씀해 주세요.",
      alternative: "공식적인 이의 신청 또는 민원 심의 절차를 통해 재검토를 요청하실 수 있습니다. 안내해 드릴까요?",
      avoid: [
        "또 오셨네요 (무례한 표현)",
        "이미 말씀드렸잖아요 (비공감적 표현)",
        "바뀌는 건 없어요 (단정적 표현)",
      ],
    },
  },
  {
    id: "staff-change-request",
    title: "담당자 교체 요구",
    icon: "🔁",
    description: "다른 담당자나 상급자를 요구하는 경우",
    defaultResponse: {
      immediate: "제가 최선을 다해 도와드리겠습니다. 처리에 어려움이 있으시다면 관리자를 연결해 드릴 수도 있습니다.",
      empathy: "불편을 느끼신 부분이 있으셨다면 죄송합니다. 어떤 부분에서 불편하셨는지 말씀해 주시면 더 잘 도와드릴 수 있습니다.",
      principle: "현재 담당 업무로서 처리해 드릴 수 있는 내용은 안내해 드리겠습니다. 필요하시면 관리자 연결도 가능합니다.",
      alternative: "관리자 연결을 원하시면 잠시 기다려 주시면 연결해 드리겠습니다.",
      avoid: [
        "저 말고는 처리 못 해요 (불필요한 거절)",
        "관리자도 동일합니다 (사전 차단)",
        "왜 저한테 그러세요 (감정적 대응)",
      ],
    },
  },
  {
    id: "exception-request",
    title: "규정 예외 요구",
    icon: "⚖️",
    description: "본인 상황에 대한 특별 예외 처리를 요구하는 경우",
    defaultResponse: {
      immediate: "말씀하신 상황을 자세히 확인해 보겠습니다. 현재 적용되는 처리 기준과 가능한 방법을 안내해 드리겠습니다.",
      empathy: "특별한 상황이 있으셔서 불편하신 점 충분히 이해합니다.",
      principle: "모든 민원은 동일한 기준으로 처리되어야 하며, 관련 규정과 사실관계 확인이 필요합니다. 현재 가능한 방법을 찾아보겠습니다.",
      alternative: "특별한 사유가 있으시다면 관련 서류를 제출하시면 담당 부서에서 검토해 드릴 수 있습니다.",
      avoid: [
        "특별 대우는 불가능합니다 (단정적 거절)",
        "다 그렇게 해드릴 수는 없어요 (비공감적 표현)",
        "알아서 하세요 (책임 방기)",
      ],
    },
  },
  {
    id: "unfriendly-claim",
    title: "불친절 주장",
    icon: "😤",
    description: "담당자가 불친절했다는 주장",
    defaultResponse: {
      immediate: "불편하게 느끼셨다면 죄송합니다. 어떤 부분이 불편하셨는지 말씀해 주시면 더 잘 도와드리겠습니다.",
      empathy: "응대 과정에서 불편하셨던 점이 있으셨군요. 말씀해 주셔서 감사합니다.",
      principle: "더 나은 서비스를 제공하기 위해 말씀해 주신 내용을 참고하겠습니다. 지금 처리하실 사항을 말씀해 주시면 도와드리겠습니다.",
      alternative: "공식 민원으로 접수하시거나 기관 홈페이지를 통해 의견을 남기실 수도 있습니다.",
      avoid: [
        "저는 불친절하지 않았습니다 (방어적 부정)",
        "오해하신 거 아닌가요 (책임 회피)",
        "증명하실 수 있나요 (도전적 표현)",
      ],
    },
  },
  {
    id: "phone-complaint",
    title: "전화 민원",
    icon: "📞",
    description: "전화를 통한 민원 응대 상황",
    defaultResponse: {
      immediate: "안녕하세요, ○○ 담당입니다. 무엇을 도와드릴까요?",
      empathy: "말씀하신 내용 잘 들었습니다. 확인해 드리겠습니다.",
      principle: "전화상으로는 제한적인 안내만 가능하며, 정확한 처리를 위해서는 본인 확인 또는 방문이 필요할 수 있습니다.",
      alternative: "필요하신 내용이 있으시면 담당 부서 이메일이나 공식 채널을 통해 접수하시면 더 정확한 안내가 가능합니다.",
      avoid: [
        "지금 바쁩니다 (부적절한 거절)",
        "직접 오세요 (전화 응대 회피)",
        "모르겠는데요 (무책임한 표현)",
      ],
    },
  },
  {
    id: "threat",
    title: "협박·위협",
    icon: "⚠️",
    description: "신체적 위협, 민원 협박, 법적 위협",
    isHighRisk: true,
    defaultResponse: {
      immediate: "지금 하시는 말씀은 업무 처리에 도움이 되지 않습니다. 안전하고 원활한 업무 환경을 위해 정상적인 민원 절차를 이용해 주시기 바랍니다.",
      empathy: "불편하신 점이 있으신 것은 이해합니다만, 협박이나 위협적인 언행은 업무 처리에 영향을 미칠 수 없습니다.",
      principle: "모든 민원은 정해진 절차에 따라 처리됩니다. 법적·행정적 이의 신청 절차를 통해 공식적으로 처리하실 수 있습니다.",
      alternative: "공식 이의 신청 또는 옴부즈맨 등 공식 채널을 통해 문제를 해결하시기 바랍니다.",
      avoid: [
        "그러시면 처리해 드릴 수 없어요 (감정적 거절)",
        "무서워요 (감정 노출)",
        "그렇게 하세요 (무책임한 동조)",
      ],
      warning: "🚨 신체적 위협이 느껴지는 경우 즉시 안전한 장소로 이동하고 관리자 및 경찰에 연락하세요. 본인 안전이 최우선입니다. 기관의 특이민원 대응 매뉴얼을 확인하세요.",
    },
  },
  {
    id: "grievance",
    title: "억울함 호소",
    icon: "😢",
    description: "자신의 상황이 억울하다며 감정적으로 호소하는 경우",
    defaultResponse: {
      immediate: "말씀하신 내용을 자세히 들었습니다. 억울하고 답답하셨을 것 같습니다. 관련 사항을 확인해 드리겠습니다.",
      empathy: "상황이 원하시는 대로 되지 않아 많이 답답하고 억울하셨겠습니다. 충분히 공감합니다.",
      principle: "현재 사실관계와 적용 규정을 정확히 확인한 뒤 안내해 드리겠습니다. 관련된 모든 내용을 검토하겠습니다.",
      alternative: "처리 결과에 이의가 있으시면 공식 이의 신청 절차를 안내해 드릴 수 있습니다.",
      avoid: [
        "어쩔 수 없어요 (공감 부재)",
        "그건 규정이에요 (단절적 설명)",
        "다들 그렇게 생각해요 (억울함 부정)",
      ],
    },
  },
];

export const complaintTypeMap = Object.fromEntries(
  complaintTypes.map((type) => [type.id, type])
);
