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
    console.log("API 요청 받음:", { date, time });
    
    if (!date || !time) {
        return res.status(400).json({ message: '날짜와 시간을 모두 지정해주세요.' });
    }

    try {
        const notion = new Client({ auth: process.env.NOTION_API_KEY });
        
        // 시간 형식 변환
        let notionTimeFormat;
        switch(time) {
            case "0730": notionTimeFormat = "07:30 - 08:30"; break;
            case "1230": notionTimeFormat = "12:30 - 13:30"; break;
            case "1630": notionTimeFormat = "16:30 - 17:30"; break;
            case "thursday": notionTimeFormat = "(목요일 한정) 15:30 - 16:30"; break;
            default: notionTimeFormat = time;
        }

        console.log("Notion 시간 형식:", notionTimeFormat);

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
                            equals: notionTimeFormat
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

        const reservedSeats = response.results
            .map(page => {
                const seatNum = page.properties["좌석 번호"]?.select?.name;
                return seatNum ? Number(seatNum) : null;
            })
            .filter(seat => seat !== null && seat !== "N/A");

        console.log("예약된 좌석:", reservedSeats);

        return res.status(200).json({ 
            reservedSeats,
            debug: {
                requestTime: time,
                notionTime: notionTimeFormat,
                resultsCount: response.results.length
            }
        });
    } catch (error) {
        console.error("Notion API 오류:", error);
        return res.status(500).json({ 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}
