/**
 * DB 모듈: better-sqlite3 사용 가능 시 실제 DB, 불가 시 Mock 사용
 * Vercel 배포 환경 또는 better-sqlite3 미설치 시 Mock으로 동작 (랜딩 페이지/정적 빌드용)
 */
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dbPath = join(__dirname, 'paoir.db')

/** Mock DB: prepare().run() 호출 시 아무것도 하지 않음 */
const createMockDb = () => ({
  prepare: () => ({ run: () => {} }),
  exec: () => {}
})

let db = null
let useMock = false

try {
  const Database = (await import('better-sqlite3')).default
  db = new Database(dbPath)
  db.exec(`
    CREATE TABLE IF NOT EXISTS responses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      target TEXT NOT NULL,
      gender TEXT,
      region TEXT,
      status TEXT,
      detail TEXT,
      concern TEXT,
      answers TEXT NOT NULL,
      aoir_a INTEGER,
      aoir_o INTEGER,
      aoir_i INTEGER,
      aoir_r INTEGER,
      p_struggling INTEGER,
      p_rebellion INTEGER,
      p_perfection INTEGER,
      p_stubborn INTEGER,
      p_distraction INTEGER,
      p_satisfaction INTEGER,
      p_moderate INTEGER,
      p_dependency INTEGER,
      p_boredom INTEGER,
      result_type TEXT,
      efficiency_index REAL,
      efficiency_effective_sum INTEGER,
      report_summary TEXT,
      report_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
  // 기존 DB 마이그레이션 (새 컬럼 추가)
  const cols = ['efficiency_index', 'efficiency_effective_sum', 'report_summary', 'report_json', 'detail', 'concern']
  cols.forEach(col => {
    try { db.exec(`ALTER TABLE responses ADD COLUMN ${col} ${col.includes('_sum') ? 'INTEGER' : col.includes('_index') ? 'REAL' : 'TEXT'}`) } catch (_) {}
  })
} catch (err) {
  console.warn('[DB] better-sqlite3 미사용, Mock 모드로 동작:', err.message)
  db = createMockDb()
  useMock = true
}

export { db, useMock }
