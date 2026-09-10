export default {
  async fetch(request, env) {
    // POST /chat 요청만 처리
    if (request.method === "POST" && new URL(request.url).pathname === "/chat") {
      try {
        const data = await request.json();
        const question = data.question;

        if (!question) {
          return new Response(
            JSON.stringify({ error: "질문을 입력해주세요." }),
            {
              status: 400,
              headers: { "Content-Type": "application/json; charset=UTF-8" }
            }
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
                    text: `당신은 대한민국 세무회계 전문 AI 상담 도우미입니다.

세금과 회계에 관한 질문에 정확하고 이해하기 쉽게 답변하세요.

답변 원칙:
1. 확인되지 않은 세법 내용을 지어내지 않습니다.
2. 확실하지 않은 내용은 확실하지 않다고 명확하게 안내합니다.
3. 가능한 경우 관련 법령이나 국세청 자료를 확인하도록 안내합니다.
4. 개인의 구체적인 세금 신고 결과를 단정하지 않습니다.
5. 전문적인 세무대리가 필요한 경우 세무사 또는 세무전문가 상담을 권고합니다.
6. 어려운 세무 용어는 일반인이 이해하기 쉽게 설명합니다.`
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
          return new Response(
            JSON.stringify({
              error: "Gemini API 오류가 발생했습니다.",
              detail: result
            }),
            {
              status: response.status,
              headers: { "Content-Type": "application/json; charset=UTF-8" }
            }
          );
        }

        const answer =
          result.candidates?.[0]?.content?.parts?.[0]?.text ||
          "답변을 가져오지 못했습니다.";

        return new Response(
          JSON.stringify({ answer }),
          {
            headers: {
              "Content-Type": "application/json; charset=UTF-8"
            }
          }
        );

      } catch (error) {
        return new Response(
          JSON.stringify({
            error: "서버에서 오류가 발생했습니다."
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json; charset=UTF-8"
            }
          }
        );
      }
    }

    return new Response("세무 AI 서버가 정상적으로 작동하고 있습니다.");
  }
};
