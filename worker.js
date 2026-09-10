export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // AI 질문 처리
    if (url.pathname === "/chat" && request.method === "POST") {
      try {
        const data = await request.json();
        const question = data.question;

        if (!question) {
          return Response.json(
            { error: "질문을 입력해주세요." },
            { status: 400 }
          );
        }

        const response = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": env.GEMINI_API_KEY
            },
            body: JSON.stringify({
              system_instruction: {
                parts: [
                  {
                    text: `
당신은 대한민국 세무회계 전문 AI 상담 도우미입니다.

사용자의 세금 및 세무회계 관련 질문에 정확하고 이해하기 쉽게 답변합니다.

답변 원칙:
1. 확인되지 않은 세법 내용을 지어내지 않습니다.
2. 확실하지 않은 내용은 확실하지 않다고 명확하게 안내합니다.
3. 세법은 개정될 수 있으므로 중요한 내용은 최신 국세청 자료나 법령을 확인하도록 안내합니다.
4. 어려운 세무 용어는 일반인이 이해하기 쉽게 설명합니다.
5. 개인의 구체적인 세금 신고 결과를 단정하지 않습니다.
6. 필요한 경우 세무사 등 전문가 상담을 권고합니다.
7. 답변은 한국어로 작성합니다.
`
                  }
                ]
              },
              contents: [
                {
                  parts: [
                    {
                      text: question
                    }
                  ]
                }
              ]
            })
          }
        );

        const result = await response.json();

        if (!response.ok) {
          return Response.json(
            {
              error: "Gemini API 호출에 실패했습니다.",
              detail: result
            },
            { status: response.status }
          );
        }

        const answer =
          result.candidates?.[0]?.content?.parts?.[0]?.text;

        return Response.json({
          answer: answer || "답변을 가져오지 못했습니다."
        });

      } catch (error) {
        return Response.json(
          {
            error: "서버 오류가 발생했습니다.",
            detail: error.message
          },
          { status: 500 }
        );
      }
    }

    // 일반 페이지 요청은 index.html로 전달
    return env.ASSETS.fetch(request);
  }
};
