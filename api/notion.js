import { Client } from '@notionhq/client';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const notion = new Client({
        auth: process.env.NOTION_API_KEY
    });

    try {
        // 🔹 timeSlot 값이 undefined이면 기본값을 설정
        const timeSlot = req.body.timeSlot ? req.body.timeSlot : "시간 미정";  

        const notionData = {
            parent: { database_id: process.env.NOTION_DATABASE_ID },  
            properties: {
                "이름": { title: [{ text: { content: req.body.name } }] },
                "학번": { number: parseInt(req.body.studentId) },
                "이메일": { email: req.body.email },
                "예약 날짜": { date: { start: req.body.date } },
                "공간 유형": { select: { name: req.body.roomType } },
                "층 선택": { rich_text: [{ text: { content: req.body.floor || "" } }] },
                "좌석 번호": { number: parseInt(req.body.seat) },
                "예약 시간": { select: { name: timeSlot } }  // ✅ timeSlot 값을 안전하게 전달
            }
        };

        console.log("📡 Notion API로 전송할 데이터:", JSON.stringify(notionData, null, 2));

        const response = await notion.pages.create(notionData);
        return res.status(200).json(response);
    } catch (error) {
        console.error('🚨 Notion API 오류 발생:', error);
        return res.status(500).json({ error: error.message });
    }
}
