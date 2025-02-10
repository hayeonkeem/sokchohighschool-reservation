// api/reserved-seats.js
import { reservations } from '../data/reservations';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { date, time } = req.query;
  
  if (!date || !time) {
    return res.status(400).json({ message: '날짜와 시간을 모두 지정해주세요.' });
  }

  const key = `${date}-${time}`;
  const reservedSeats = reservations[key] || [];

  return res.status(200).json({ reservedSeats });
}
