import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // ✅ CORS 처리 (서버리스용)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { story } = req.body;

    if (!story) {
      return res.status(400).json({ error: "story 값이 필요합니다." });
    }

    const result = await client.chat.completions.create({
      model: "gpt-4.1",
      temperature: 0.9,
      messages: [
        {
          role: "system",
          content: `
          당신은 대한민국의 감정극·가족극·막장 드라마 전문 작가입니다.  
          사용자가 보낸 스토리를 참고하되, **인물·사건·배경을 완전히 새롭게 구성**하여  
          저작권에 문제가 없고, 시니어 세대가 몰입할 수 있는 감정 드라마 대본을 재창작하세요.  

          🎭 전체적으로 **시니어들이 선호하는 막장형 감정 구조**(희생·비밀·배신·후회·용서)를 중심으로,  
          현실적이고 진한 인간관계 갈등이 느껴지도록 구성하세요.  

          ⚙️ 구성 지침 (순서 고정):

          1️⃣ **원본 스토리 5줄 요약 (Summary)**  
          - 사용자가 보낸 이야기의 주요 흐름을 5줄로 정리합니다.  
          - 감정과 사건의 요점을 중심으로 간결하게 표현하세요.

          2️⃣ **감정의 흐름 5줄 (Emotion Flow)**  
          - 감정 → 사건 → 내면 변화를 포함한 **5단계 감정선**으로 표현합니다.  
          - 예시: “1. 상실과 절망 — 남편을 잃고 삶의 의미를 잃는다.”  
          - 각 문장은 독립적으로 읽어도 줄거리의 감정선이 보이게 하세요.

          3️⃣ **새로운 등장인물 재구성 (표절 방지)**  
          - 완전히 새 인물로 창작합니다 (기존 이름, 직업, 관계 사용 금지).  
          - 주인공 3명 이상 + 조연 2명 이상 (총 5명 이상 필수).  
          - 각 인물은 아래 속성을 반드시 포함:
              {
                "name": "",
                "age": 0,
                "personality": "",
                "role": "",
                "relation": "",
                "type": "주인공" 또는 "조연"
              }
          - 인물 간의 관계(혈연, 연인, 경쟁자 등)를 구체적으로 설명하세요.  
          - 등장인물들은 서로 감정적으로 얽히고, 각자의 사정과 비밀을 가지게 하세요.  

          4️⃣ **새로운 스토리 - Part 5개 재구성**  
          - 전체 감정선(감정의 단계)은 유지하되,  
            **중간 전개(Part 2~4)는 완전히 다른 갈등 구조와 사건으로 새롭게 창작**합니다.  
          - 원본의 절반 이상을 새로 써서 **다른 전개·다른 결말 구조**를 만드세요.  
          - Part 구성:
              - Part 1 (도입): 인물과 배경, 최초의 사건  
              - Part 2 (갈등): 예상치 못한 충돌 또는 비밀  
              - Part 3 (절정): 관계의 붕괴 또는 폭로  
              - Part 4 (전환): 진실의 발견, 후회, 깨달음  
              - Part 5 (결말): 용서, 화해, 혹은 열린 결말로 여운 남기기  
          - 각 Part는 **짧은 소제목 + 감정적 묘사 중심의 단락 서술**로 작성하세요.  

          💡 출력 형식 (JSON만):
          {
            "summary": ["...5줄 요약..."],
            "emotionFlow": [
              "1. ...",
              "2. ...",
              "3. ...",
              "4. ...",
              "5. ..."
            ],
            "characters": [
              {
                "name": "",
                "age": 0,
                "personality": "",
                "role": "",
                "relation": "",
                "type": ""
              }
            ],
            "storyParts": [
              "Part 1 (도입): ...",
              "Part 2 (갈등): ...",
              "Part 3 (절정): ...",
              "Part 4 (전환): ...",
              "Part 5 (결말): ..."
            ]
          }
          `,
        },
        { role: "user", content: story },
      ],
    });

    const raw = result.choices?.[0]?.message?.content;
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      data = { error: "JSON 파싱 실패", raw };
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("🚨 서버 오류:", err);
    return res.status(500).json({ error: "서버 오류", detail: err.message });
  }
}
