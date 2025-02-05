import { Client } from '@notionhq/client';

// Notion 클라이언트 생성
const notion = new Client({
    auth: process.env.NOTION_API_KEY
});

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        console.log("📡 Notion에 전송할 데이터:", req.body);

        const response = await notion.pages.create({
            parent: { database_id: process.env.NOTION_DATABASE_ID },
            properties: {
                "이름": { title: [{ text: { content: req.body.name } }] },
                "학번": { rich_text: [{ text: { content: req.body.studentId } }] },
                "이메일": { email: req.body.email },
                "예약 날짜": { date: { start: req.body.date } },
                "공간 유형": { select: { name: req.body.roomType } },
                "층 선택": { rich_text: [{ text: { content: req.body.floor } }] },
                "좌석 번호": { number: parseInt(req.body.seat) },
                "예약 시간": { select: { name: req.body.timeSlot } }
            }
        });

        console.log("✅ Notion 저장 완료:", response);
        return res.status(200).json({ success: true, data: response });

    } catch (error) {
        console.error('🚨 Notion API 오류:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
