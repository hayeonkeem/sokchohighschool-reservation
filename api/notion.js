import { Client } from "@notionhq/client";

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    // ✅ 1. Notion API Key & Database ID 디버깅 출력
    console.log("🔑 NOTION_API_KEY:", process.env.NOTION_API_KEY ? "✅ 존재함" : "❌ 없음");
    console.log("📂 NOTION_DATABASE_ID:", process.env.NOTION_DATABASE_ID);

    const notion = new Client({
        auth: process.env.NOTION_API_KEY
    });

    try {
        // ✅ 2. 요청 데이터 디버깅
        console.log("📨 요청 데이터:", req.body);

        const response = await notion.pages.create(req.body);

        // ✅ 3. 응답 데이터 디버깅
        console.log("✅ Notion 응답:", response);

        return res.status(200).json(response);
    } catch (error) {
        // ❌ 4. 오류 발생 시, 상세 로그 출력
        console.error("🚨 Notion API 오류 발생:", error);

        return res.status(500).json({ error: error.message });
    }
}
