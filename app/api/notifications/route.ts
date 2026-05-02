import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET(req: NextRequest) {
  const session = await getSession()
  
  // Even if not logged in, they can see broadcast notifications (null user_id)
  // But usually we show personalized ones for logged in users
  const userId = session?.userId
  
  const sql = userId 
    ? `SELECT n.* FROM notifications n
       LEFT JOIN notification_dismissals nd ON nd.notification_id = n.id AND nd.user_id = $1
       WHERE (n.user_id = $1 OR n.user_id IS NULL) AND nd.notification_id IS NULL
       ORDER BY n.created_at DESC LIMIT 5`
    : `SELECT * FROM notifications 
       WHERE user_id IS NULL 
       ORDER BY created_at DESC LIMIT 5`
       
  const result = await query(sql, userId ? [userId] : [])
  return NextResponse.json({ notifications: result.rows })
}

export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = session.userId

  // Record dismissals for all notifications currently visible to this user
  await query(`
    INSERT INTO notification_dismissals (user_id, notification_id)
    SELECT $1, id FROM notifications 
    WHERE (user_id = $1 OR user_id IS NULL)
    ON CONFLICT DO NOTHING
  `, [userId])
  
  return NextResponse.json({ success: true })
}
