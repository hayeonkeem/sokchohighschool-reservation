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
        const response = await notion.pages.create(req.body);
        return res.status(200).json(response);
    } catch (error) {
        console.error('Notion API error:', error);
        return res.status(500).json({ error: error.message });
    }
}
