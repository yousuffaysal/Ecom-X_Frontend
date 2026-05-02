import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET(req: NextRequest) {
  const session = await getSession()
  
  // Even if not logged in, they can see broadcast notifications (null user_id)
  // But usually we show personalized ones for logged in users
  const userId = session?.userId
  
  const sql = userId 
    ? `SELECT * FROM notifications 
       WHERE user_id = $1 OR user_id IS NULL 
       ORDER BY created_at DESC LIMIT 5`
    : `SELECT * FROM notifications 
       WHERE user_id IS NULL 
       ORDER BY created_at DESC LIMIT 5`
       
  const result = await query(sql, userId ? [userId] : [])
  return NextResponse.json({ notifications: result.rows })
}
