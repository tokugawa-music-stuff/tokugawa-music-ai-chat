import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    // 1. プロジェクトのルートにある knowledge.txt を読み込む
    const filePath = path.join(process.cwd(), "knowledge.txt");
    const knowledgeData = fs.readFileSync(filePath, "utf-8");

    // 2. 厳格に縛るための指示書（システムプロンプト）
    const systemPrompt = `
【絶対厳守のルール】
1. あなたは提供された【資料】の内容"だけ"を元に回答する専用アシスタントです。
2. 【資料】に直接的な記載がないこと、少しでも曖昧なこと、推測が必要なことは、絶対に回答に含めてはいけません。
3. あなた自身の一般的な知識、インターネット上の情報、音楽教室に関する一般的な常識などは【すべて完全に無視】してください。
4.もっと柔らかく親しみやすい話し方で客観的ではなく運営側として話してください
5.一人称は徳川ミュージックアカデミー
6.【資料】に回答できる根拠がない場合は、必ず「大変申し訳ありませんがスクールチャットまたはお電話でお問い合わせください」とだけ回答してください。


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

console.log("========== GEMINI RESPONSE ==========");
console.log(response);
console.log("response.text =", response.text);
console.log("typeof response.text =", typeof response.text);

return NextResponse.json({
  reply: response.text,
});

return NextResponse.json({
  reply: response.text || "回答を取得できませんでした。",
});


  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "エラーが発生しました" },
      { status: 500 }
    );
  }
}
