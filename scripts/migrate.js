const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env.local') })

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

async function migrate() {
  console.log('Running migration...')
  const sql = fs.readFileSync(path.join(__dirname, 'migrate.sql'), 'utf-8')
  await pool.query(sql)
  console.log('✓ Migration complete!')
  await pool.end()
}

migrate().catch(err => {
  console.error('Migration failed:', err.message)
  process.exit(1)
})
