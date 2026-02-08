import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import Database from 'better-sqlite3'
import nodemailer from 'nodemailer'
import { fileURLToPath, pathToFileURL } from 'url'
import { dirname, join } from 'path'
import { appendToSheet, ensureSheetHeaders, updateSatisfactionInSheet } from './googleSheets.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dbPath = join(__dirname, 'paoir.db')

const app = express()
app.use(cors())
app.use(express.json())

const db = new Database(dbPath)

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
try {
  db.exec('ALTER TABLE responses ADD COLUMN efficiency_index REAL')
} catch (_) {}
try {
  db.exec('ALTER TABLE responses ADD COLUMN efficiency_effective_sum INTEGER')
} catch (_) {}
try {
  db.exec('ALTER TABLE responses ADD COLUMN report_summary TEXT')
} catch (_) {}
try {
  db.exec('ALTER TABLE responses ADD COLUMN report_json TEXT')
} catch (_) {}
try {
  db.exec('ALTER TABLE responses ADD COLUMN detail TEXT')
} catch (_) {}
try {
  db.exec('ALTER TABLE responses ADD COLUMN concern TEXT')
} catch (_) {}

async function computeScores(answers, target) {
  const enginePath = pathToFileURL(join(__dirname, '..', 'src', 'lib', 'analysisEngine.js')).href
  const { generateReport } = await import(enginePath)
  return generateReport(answers, target)
}

app.post('/api/submit', async (req, res) => {
  try {
    const { email, nickname, participationCode, target, gender, region, status, detail, concern, answers } = req.body
    if (!email || !answers || typeof answers !== 'object') {
      return res.status(400).json({ success: false, error: '이메일과 응답 데이터가 필요합니다.' })
    }

    const result = await computeScores(answers, target)
    const { aoir, p, summary, efficiency } = result

    const stmt = db.prepare(`
      INSERT INTO responses (
        email, target, gender, region, status, detail, concern, answers,
        aoir_a, aoir_o, aoir_i, aoir_r,
        p_struggling, p_rebellion, p_perfection, p_stubborn, p_distraction,
        p_satisfaction, p_moderate, p_dependency, p_boredom,
        result_type, efficiency_index, efficiency_effective_sum, report_summary, report_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      email, target || '', gender || '', region || '', status || '', detail || '', concern || '',
      JSON.stringify(answers),
      aoir.A, aoir.O, aoir.I, aoir.R,
      p.고군분투, p.반항, p.완벽, p.외고집, p.잡념,
      p.만족, p.적당, p.의존, p.싫증,
      result.type,
      efficiency?.efficiencyIndex ?? null,
      efficiency?.effectiveSum ?? null,
      summary || result.summary || '',
      JSON.stringify(result)
    )

    // Google Sheets 실시간 전송 (닉네임·참여코드 맨 앞 열)
    const sheetResult = await appendToSheet({
      nickname: nickname || '',
      participationCode: participationCode || '',
      email,
      target: target || '',
      gender: gender || '',
      region: region || '',
      detail: detail || '',
      answers,
      aoir,
      p,
      efficiencyIndex: efficiency?.efficiencyIndex ?? '',
      keyFactors: result.keyFactors || [],
      summary: summary || result.summary || '',
      type: result.type || '',
      responseTime: new Date().toISOString()
    })

    if (sheetResult?.skipped) {
      console.log('[Sheets] 조건 미충족으로 전송 생략')
    } else if (!sheetResult?.success) {
      console.warn('[Sheets] 전송 실패 (DB 저장은 완료됨)')
    }

    res.json({ success: true, result })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, error: err.message })
  }
})

// 만족도(별점) 제출 → 구글 시트 해당 행 업데이트
app.post('/api/submit-rating', async (req, res) => {
  try {
    const { nickname, participationCode, score } = req.body
    if (!nickname || !participationCode || score == null) {
      return res.status(400).json({ success: false, error: '닉네임, 참여코드, 만족도 점수가 필요합니다.' })
    }
    const s = Number(score)
    if (!Number.isFinite(s) || s < 1 || s > 5) {
      return res.status(400).json({ success: false, error: '만족도는 1~5점이어야 합니다.' })
    }

    const result = await updateSatisfactionInSheet(
      String(nickname).trim(),
      String(participationCode).trim(),
      s
    )

    if (result.success) {
      res.json({ success: true, message: '만족도가 저장되었습니다.' })
    } else {
      res.status(500).json({ success: false, error: result.error || '저장 실패' })
    }
  } catch (err) {
    console.error('[만족도 제출 오류]', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

// 결과 PDF 이메일 전송
app.post('/api/send-result-email', async (req, res) => {
  try {
    const { email, pdfBase64 } = req.body
    if (!email || !pdfBase64) {
      return res.status(400).json({ success: false, error: '이메일과 PDF 데이터가 필요합니다.' })
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return res.status(500).json({
        success: false,
        error: '이메일 전송 설정이 없습니다. SMTP_USER, SMTP_PASS 환경변수를 설정해 주세요.'
      })
    }

    const pdfBuffer = Buffer.from(pdfBase64, 'base64')

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: '[PAIOR] 진단 결과 리포트',
      text: 'PAIOR(파이오르) 진단 결과가 첨부되어 있습니다.',
      attachments: [
        {
          filename: `PAIOR_진단결과_${Date.now()}.pdf`,
          content: pdfBuffer
        }
      ]
    })

    res.json({ success: true, message: '이메일이 전송되었습니다.' })
  } catch (err) {
    console.error('[이메일 전송 오류]', err)
    res.status(500).json({
      success: false,
      error: err.message || '이메일 전송에 실패했습니다.'
    })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, async () => {
  console.log(`PAIOR API 서버 실행 중: http://localhost:${PORT}`)
  await ensureSheetHeaders()
})
