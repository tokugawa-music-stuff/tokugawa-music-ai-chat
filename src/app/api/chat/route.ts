import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

// knowledge.txtを起動時に1回だけ読み込み
let knowledgeData = "";

try {
  knowledgeData = fs.readFileSync(
    path.join(process.cwd(), "knowledge.txt"),
    "utf-8"
  );
} catch (error) {
  console.error("knowledge.txt 読み込み失敗:", error);
}

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

        if (
      typeof message !== "string" ||
      !message.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_MESSAGE",
          reply:
            "質問内容を確認してください。もう一度入力をお願いいたします。",
        },
        { status: 400 }
      );
    }

    if (!knowledgeData) {
      return NextResponse.json(
        {
          success: false,
          error: "KNOWLEDGE_NOT_FOUND",
          reply:
            "現在、回答データを読み込めない状態です。時間をおいて再度お試しください。",
        },
        { status: 500 }
      );
    }

    if (message.length > 1000) {
      return NextResponse.json(
        {
          success: false,
          error: "MESSAGE_TOO_LONG",
          reply:
            "質問が長すぎるため送信できませんでした。内容を短くしてお試しください。",
        },
        { status: 400 }
      );
    }

  

    // 2. 厳格に縛るための指示書（システムプロンプト）
    const systemPrompt = `
【あなたの役割】
あなたは「徳川ミュージックアカデミー」の公式チャットアシスタントです。
保護者や生徒さんからのお問い合わせに対応する、教室スタッフのような立場で回答してください。

【回答ルール】
1. 回答は必ず【資料】に書かれている内容だけを元にしてください。
2. 【資料】に記載がない内容、判断できない内容、推測が必要な内容については回答しないでください。
3. 分からない場合は「教室までお問い合わせください」と丁寧に案内してください。
4. 一般的な音楽教室の知識やインターネット上の情報は使用しないでください。

【話し方】
1. 徳川ミュージックアカデミーのスタッフが直接対応しているような、温かく親しみやすい文章にしてください。
2. かしこまりすぎず、保護者の方が安心できる自然な丁寧語を使用してください。
3. 冷たい説明文ではなく、相手に寄り添う表現を意識してください。
4. 一人称は「徳川ミュージックアカデミー」を使用してください。
5. 「私」「僕」「AI」などの表現は使用しないでください。

【禁止事項】
・資料にない料金、空き状況、日時、講師情報などを推測して回答しない。
・存在しないキャンペーンやサービスを作らない。
・質問に答えるために不足している情報を勝手に補完しない。


【資料】
${knowledgeData}
`;

    // 3. config の中に systemInstruction を入れて呼び出す
 const response = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: message,
  config: {
    systemInstruction: systemPrompt,
  },
});

console.log("Gemini response received");


if (!response.text) {
  return NextResponse.json({
    success: false,
    error: "NO_REPLY",
    reply:
      "申し訳ありません。回答を生成できませんでした。時間をおいて再度お試しください。",
  });
}

return NextResponse.json({
  success: true,
  reply: response.text,
});



  } catch (error) {
  console.error("Gemini API Error:", error);

    return NextResponse.json({
    success: false,
    error: "API_ERROR",
    reply:
      "申し訳ありません。現在回答を取得できませんでした。少し時間をおいて再度お試しください。",
  });
  }
}