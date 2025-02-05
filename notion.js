import { Client } from '@notionhq/client';

export default async function handler(req, res) {
  const notion = new Client({ auth: process.env.NOTION_API_KEY });
  
  try {
    const response = await notion.pages.create(req.body);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}