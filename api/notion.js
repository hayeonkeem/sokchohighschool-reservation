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
        console.log("📌 요청 데이터:", formData);

        const response = await notion.pages.create({
            parent: { database_id: process.env.NOTION_DATABASE_ID },
            properties: {
                "이름": { title: [{ text: { content: formData.name } }] },
                "학번": { number: parseInt(formData.studentId) },
                "이메일": { email: formData.email },
                "예약 날짜": { date: { start: formData.date } },  // ✅ date 형식으로 변경
                "공간 유형": { select: { name: formData.roomType } },
                "층 선택": { select: { name: formData.floor || "N/A" } }, // ✅ 선택 없으면 "N/A"
                "좌석 번호": { select: { name: formData.seat || "N/A" } }, // ✅ 선택 없으면 "N/A"
                "예약 시간": { select: { name: formData.timeSlot } }  // ✅ select 형식으로 변경
            }
        });

        console.log("✅ 예약 성공:", response);
        return res.status(200).json(response);
    } catch (error) {
        console.error("❌ Notion API 오류 발생:", error);
        return res.status(500).json({ error: error.message });
    }
}
