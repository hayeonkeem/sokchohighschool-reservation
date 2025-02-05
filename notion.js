// pages/api/notion.js
import { Client } from '@notionhq/client';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const notion = new Client({ auth: process.env.NOTION_API_KEY });
    
    try {
        if (req.body.filter) {
            // 예약된 좌석 조회
            const response = await notion.databases.query({
                database_id: process.env.NOTION_DATABASE_ID,
                filter: req.body.filter
            });
            return res.status(200).json(response);
        } else {
            // 새 예약 생성
            const response = await notion.pages.create(req.body);
            return res.status(200).json(response);
        }
    } catch (error) {
        console.error('Notion API error:', error);
        return res.status(500).json({ error: error.message });
    }
}