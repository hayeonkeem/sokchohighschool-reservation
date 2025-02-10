// api/reserved-seats.js
import { Client } from "@notionhq/client";

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { date, time } = req.query;
    
    if (!date || !time) {
        return res.status(400).json({ message: '날짜와 시간을 모두 지정해주세요.' });
    }

    try {
        const notion = new Client({ auth: process.env.NOTION_API_KEY });

        // Notion 데이터베이스에서 해당 날짜와 시간의 예약 조회
        const response = await notion.databases.query({
            database_id: process.env.NOTION_DATABASE_ID,
            filter: {
                and: [
                    {
                        property: "예약 날짜",
                        date: {
                            equals: date
                        }
                    },
                    {
                        property: "예약 시간",
                        select: {
                            equals: time
                        }
                    },
                    {
                        property: "공간 유형",
                        select: {
                            equals: "study"
                        }
                    }
                ]
            }
        });

        // 예약된 좌석 번호 추출
        const reservedSeats = response.results
            .map(page => page.properties["좌석 번호"]?.select?.name)
            .filter(seat => seat && seat !== "N/A")
            .map(seat => Number(seat));

        console.log(`📅 ${date} ${time} 예약된 좌석:`, reservedSeats);
        return res.status(200).json({ reservedSeats });
    } catch (error) {
        console.error("❌ Notion API 오류:", error);
        return res.status(500).json({ error: error.message });
    }
}
