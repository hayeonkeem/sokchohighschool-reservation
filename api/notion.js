import { Client } from "@notionhq/client";

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    const notion = new Client({ auth: process.env.NOTION_API_KEY });

    try {
        const formData = req.body;

        const response = await notion.pages.create({
            parent: { database_id: process.env.NOTION_DATABASE_ID },
            properties: {
                "이름": { title: [{ text: { content: formData.name } }] }, // ✅ 텍스트 (title)
                "학번": { number: Number(formData.studentId) }, // ✅ 숫자 (number)
                "이메일": { email: formData.email }, // ✅ 이메일 (email)
                "예약 날짜": { select: { name: formData.date } }, // ✅ 선택 (select)
                "공간 유형": { select: { name: formData.roomType } }, // ✅ 선택 (select)
                "층 선택": { select: { name: formData.floor } }, // ✅ 선택 (select)
                "좌석 번호": { select: { name: String(formData.seat) } }, // ✅ 선택 (select) → 숫자를 문자열로 변환
                "예약 시간": { select: { name: formData.timeSlot } }, // ✅ 선택 (select)
            },
        });

        return res.status(200).json(response);
    } catch (error) {
        console.error("Notion API error:", error);
        return res.status(500).json({ error: error.message });
    }
}
