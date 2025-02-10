// api/reserved-seats.js
import { Client } from "@notionhq/client";

export default async function handler(req, res) {
    // CORS 헤더 설정
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { date, time } = req.query;
    console.log("Received query:", { date, time }); // 디버깅 로그 1
    
    if (!date || !time) {
        return res.status(400).json({ message: '날짜와 시간을 모두 지정해주세요.' });
    }

    try {
        const notion = new Client({ auth: process.env.NOTION_API_KEY });
        
        // 간단한 테스트를 위해 직접 시간 매핑
        const timeMapping = {
            "07:30 - 08:30": "07:30 - 08:30",
            "12:30 - 13:30": "12:30 - 13:30",
            "16:30 - 17:30": "16:30 - 17:30",
            "(목요일 한정) 15:30 - 16:30": "(목요일 한정) 15:30 - 16:30",
            "0730": "07:30 - 08:30",
            "1230": "12:30 - 13:30",
            "1630": "16:30 - 17:30",
            "thursday": "(목요일 한정) 15:30 - 16:30"
        };

        const mappedTime = timeMapping[time] || time;
        console.log("Mapped time:", mappedTime); // 디버깅 로그 2

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
                            equals: mappedTime
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

        console.log("Notion response:", JSON.stringify(response.results, null, 2)); // 디버깅 로그 3

        const reservedSeats = response.results
            .map(page => {
                const seatNum = page.properties["좌석 번호"]?.select?.name;
                console.log("Found seat:", seatNum); // 디버깅 로그 4
                return seatNum;
            })
            .filter(seat => seat && seat !== "N/A")
            .map(seat => Number(seat));

        console.log("Final reserved seats:", reservedSeats); // 디버깅 로그 5

        return res.status(200).json({ 
            reservedSeats,
            debug: {
                originalTime: time,
                mappedTime,
                resultsCount: response.results.length
            }
        });
    } catch (error) {
        console.error("Notion API Error:", error);
        return res.status(500).json({ 
            error: error.message,
            stack: error.stack
        });
    }
}
