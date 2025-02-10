// api/reserved-seats.js
import { Client } from "@notionhq/client";

export default async function handler(req, res) {
    // CORS 및 Content-Type 헤더 설정
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Content-Type", "application/json");

    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { date, time } = req.query;
    
    if (!date || !time) {
        return res.status(400).json({ message: '날짜와 시간을 모두 지정해주세요.' });
    }

    try {
        const notion = new Client({ auth: process.env.NOTION_API_KEY });

        console.log("조회 요청:", { date, time });

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

        console.log("Notion 응답:", response.results);

        // 예약된 좌석만 추출
        const reservedSeats = response.results
            .map(page => {
                const seatNum = page.properties["좌석 번호"]?.select?.name;
                console.log("좌석 번호 추출:", seatNum);
                return seatNum && seatNum !== "N/A" ? Number(seatNum) : null;
            })
            .filter(seat => seat !== null);

        console.log("최종 예약된 좌석:", reservedSeats);

        return res.status(200).json({ 
            reservedSeats,
            debug: { date, time, resultsCount: response.results.length }
        });
    } catch (error) {
        console.error("Notion API 오류:", error);
        return res.status(500).json({ error: error.message });
    }
}
