import { Client } from "@notionhq/client";

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    const notion = new Client({
        auth: process.env.NOTION_API_KEY
    });

    try {
        const { name, studentId, email, date, roomType, floor, seat, timeSlot } = req.body;

        if (!name || !studentId || !email || !date || !roomType) {
            return res.status(400).json({ error: "모든 필드를 입력해야 합니다." });
        }

        const response = await notion.pages.create({
            parent: { database_id: process.env.NOTION_DATABASE_ID },  // ✅ 여기가 핵심
            properties: {
                "이름": { title: [{ text: { content: name } }] },
                "학번": { rich_text: [{ text: { content: studentId } }] },
                "이메일": { email: email },
                "예약 날짜": { date: { start: date } },
                "공간 유형": { select: { name: roomType } },
                "층 선택": { rich_text: [{ text: { content: floor || "" } }] },
                "좌석 번호": seat ? { number: parseInt(seat) } : undefined,
                "예약 시간": { select: { name: timeSlot } }
            }
        });

        res.status(200).json(response);
    } catch (error) {
        console.error("Notion API error:", error);
        res.status(500).json({ error: error.message });
    }
}
