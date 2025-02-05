import { Client } from '@notionhq/client';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const notion = new Client({
        auth: process.env.NOTION_API_KEY
    });

    if (!process.env.NOTION_API_KEY) {
        return res.status(500).json({ error: "Missing Notion API Key" });
    }

    try {
        const response = await notion.pages.create(req.body);
        return res.status(200).json(response);
    } catch (error) {
        console.error('🚨 Notion API 오류:', error);
        return res.status(500).json({ error: error.message });
    }
}
