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

        // 시간값 변환 함수
        function convertTimeValueToSlot(timeValue) {
            switch(timeValue) {
                case "0730": return "07:30 - 08:30";
                case "1230": return "12:30 - 13:30";
                case "1630": return "16:30 - 17:30";
                case "thursday": return "(목요일 한정) 15:30 - 16:30";
                default: return timeValue;
            }
        }

        console.log("조회 요청:", { date, time, convertedTime: convertTimeValueToSlot(time) });

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
                            equals: convertTimeValueToSlot(time)
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

        // 디버깅을 위한 로그
        console.log("Notion 응답:", response.results);

        // 예약된 좌석 번호 추출
        const reservedSeats = response.results
            .map(page => {
                const seatNum = page.properties["좌석 번호"]?.select?.name;
                console.log("좌석 번호:", seatNum);
                return seatNum;
            })
            .filter(seat => seat && seat !== "N/A")
            .map(seat => Number(seat));

        console.log(`📅 ${date} ${convertTimeValueToSlot(time)} 예약된 좌석:`, reservedSeats);
        return res.status(200).json({ reservedSeats });
    } catch (error) {
        console.error("❌ Notion API 오류:", error);
        return res.status(500).json({ error: error.message });
    }
}
