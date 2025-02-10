// api/notion.js
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
        // 먼저 해당 시간대의 좌석 예약 상태 확인
        if (req.body.roomType === "study") {
            const existingReservations = await notion.databases.query({
                database_id: process.env.NOTION_DATABASE_ID,
                filter: {
                    and: [
                        {
                            property: "예약 날짜",
                            date: {
                                equals: req.body.date
                            }
                        },
                        {
                            property: "예약 시간",
                            select: {
                                equals: req.body.timeSlot
                            }
                        },
                        {
                            property: "좌석 번호",
                            select: {
                                equals: req.body.seat
                            }
                        }
                    ]
                }
            });

            // 이미 예약된 좌석인 경우
            if (existingReservations.results.length > 0) {
                return res.status(400).json({ message: "이미 예약된 좌석입니다." });
            }
        }

        const formData = req.body;
        console.log("📌 요청 데이터:", formData);

        const response = await notion.pages.create({
            parent: { database_id: process.env.NOTION_DATABASE_ID },
            properties: {
                "이름": { title: [{ text: { content: formData.name } }] },
                "학번": { number: parseInt(formData.studentId) },
                "이메일": { email: formData.email },
                "예약 날짜": { date: { start: formData.date } },
                "공간 유형": { select: { name: formData.roomType } },
                "층 선택": { select: { name: formData.floor || "N/A" } },
                "좌석 번호": { select: { name: formData.seat || "N/A" } },
                "예약 시간": { select: { name: formData.timeSlot } }
            }
        });

        console.log("✅ 예약 성공:", response);
        return res.status(200).json(response);
    } catch (error) {
        console.error("❌ Notion API 오류:", error);
        return res.status(500).json({ error: error.message });
    }
}
