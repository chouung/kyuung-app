import { fileURLToPath } from 'url'
import { dirname } from 'path'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

import express from 'express'
import cors from 'cors'
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import fs from 'fs'
const app = express()
const PORT = process.env.PORT || 8080
const JWT_SECRET = process.env.JWT_SECRET || 'secret'

app.use(cors())
app.use(express.json())

// lowdb 세팅
const db = new Low(new JSONFile(__dirname + '/db.json'))
async function initDB() {
  await db.read()
  db.data ||= { users: [], matchRequests: [] }
  await db.write()
}
initDB()

// JWT 미들웨어
function auth(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ error: 'No token' })
  const token = authHeader.split(' ')[1]
  try {
    req.user = jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

const apiRouter = express.Router()

// 1. 회원가입
apiRouter.post('/signup', async (req, res) => {
  await db.read()
  const { email, password, name, role } = req.body
  if (!email || !password || !name || !role) return res.status(400).json({ error: '필수값 누락' })
  if (db.data.users.find(u => u.email === email)) return res.status(400).json({ error: '이미 존재하는 이메일' })
  const hash = await bcrypt.hash(password, 8)
  const id = db.data.users.length + 1
  db.data.users.push({ id, email, password: hash, name, role, bio: '', image: '', skills: [] })
  await db.write()
  res.status(201).json({ message: '회원가입 성공' })
})

// 2. 로그인
apiRouter.post('/login', async (req, res) => {
  await db.read()
  const { email, password } = req.body
  const user = db.data.users.find(u => u.email === email)
  if (!user) return res.status(401).json({ error: '이메일 또는 비밀번호 오류' })
  const ok = await bcrypt.compare(password, user.password)
  if (!ok) return res.status(401).json({ error: '이메일 또는 비밀번호 오류' })
  const token = jwt.sign(
    {
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      iss: 'lipcoding',
      aud: 'lipcoding-app',
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
      nbf: Math.floor(Date.now() / 1000),
      iat: Math.floor(Date.now() / 1000),
      jti: String(Date.now()),
    },
    JWT_SECRET
  )
  res.status(200).json({ token })
})

// 3. 내 정보 조회
apiRouter.get('/me', auth, async (req, res) => {
  await db.read()
  const user = db.data.users.find(u => u.id === req.user.sub)
  if (!user) return res.status(404).json({ error: '사용자 없음' })
  res.status(200).json({
    id: user.id,
    email: user.email,
    role: user.role,
    profile: {
      name: user.name,
      bio: user.bio,
      imageUrl: `/images/${user.role}/${user.id}`,
      ...(user.role === 'mentor' ? { skills: user.skills } : {}),
    },
  })
})

// 4. 프로필 수정
apiRouter.put('/profile', auth, async (req, res) => {
  await db.read()
  const user = db.data.users.find(u => u.id === req.user.sub)
  if (!user) return res.status(404).json({ error: '사용자 없음' })
  const { name, bio, image, skills } = req.body
  user.name = name || user.name
  user.bio = bio || user.bio
  // 이미지 저장
  if (typeof image === 'string' && image.length > 0) {
    try {
      const role = user.role
      const dir = __dirname + `/images/${role}`
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
      const filePath = `${dir}/${user.id}.png`
      fs.writeFileSync(filePath, Buffer.from(image, 'base64'))
      user.image = `${user.id}.png`
    } catch (e) {
      return res.status(500).json({ error: '이미지 저장 실패' })
    }
  }
  // mentor일 때만 skills 갱신, 값이 있을 때만
  if (user.role === 'mentor' && Array.isArray(skills)) {
    user.skills = skills
  }
  await db.write()
  res.status(200).json({
    id: user.id,
    email: user.email,
    role: user.role,
    profile: {
      name: user.name,
      bio: user.bio,
      imageUrl: `/api/images/${user.role}/${user.id}`,
      ...(user.role === 'mentor' ? { skills: user.skills } : {}),
    },
  })
})

// 프로필 이미지 반환 (실제 파일 반환, 없으면 기본 이미지)
apiRouter.get('/images/:role/:id', (req, res) => {
  const { role, id } = req.params
  const filePath = __dirname + `/images/${role}/${id}.png`
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath)
  } else {
    res.sendFile(__dirname + '/default-profile.png')
  }
})

// 6. 매칭 요청 관련 엔드포인트
apiRouter.post('/match-requests', auth, async (req, res) => {
  await db.read()
  const { mentorId, message } = req.body
  const menteeId = req.user.sub
  if (!mentorId || !message) return res.status(400).json({ error: '필수값 누락' })
  // 중복 요청 방지
  if (db.data.matchRequests.find(r => r.mentorId === mentorId && r.menteeId === menteeId && r.status === 'pending'))
    return res.status(400).json({ error: '이미 요청됨' })
  const id = db.data.matchRequests.length + 1
  db.data.matchRequests.push({ id, mentorId, menteeId, message, status: 'pending' })
  await db.write()
  res.status(200).json({ id, status: 'pending' })
})
apiRouter.get('/match-requests/incoming', auth, async (req, res) => {
  await db.read()
  const mentorId = req.user.sub
  const list = db.data.matchRequests.filter(r => r.mentorId === mentorId)
  res.status(200).json(list)
})
apiRouter.get('/match-requests/outgoing', auth, async (req, res) => {
  await db.read()
  const menteeId = req.user.sub
  const list = db.data.matchRequests.filter(r => r.menteeId === menteeId)
  res.status(200).json(list)
})
apiRouter.put('/match-requests/:id/accept', auth, async (req, res) => {
  await db.read()
  const reqId = Number(req.params.id)
  const match = db.data.matchRequests.find(r => r.id === reqId)
  if (!match) return res.status(404).json({ error: '요청 없음' })
  if (match.status !== 'pending') return res.status(400).json({ error: '이미 처리됨' })
  // 한 멘토는 한 명만 수락
  if (db.data.matchRequests.find(r => r.mentorId === match.mentorId && r.status === 'accepted'))
    return res.status(400).json({ error: '이미 수락된 요청 있음' })
  match.status = 'accepted'
  await db.write()
  res.status(200).json({ id: match.id, status: 'accepted' })
})
apiRouter.put('/match-requests/:id/reject', auth, async (req, res) => {
  await db.read()
  const reqId = Number(req.params.id)
  const match = db.data.matchRequests.find(r => r.id === reqId)
  if (!match) return res.status(404).json({ error: '요청 없음' })
  if (match.status !== 'pending') return res.status(400).json({ error: '이미 처리됨' })
  match.status = 'rejected'
  await db.write()
  res.status(200).json({ id: match.id, status: 'rejected' })
})
apiRouter.delete('/match-requests/:id', auth, async (req, res) => {
  await db.read()
  const reqId = Number(req.params.id)
  const idx = db.data.matchRequests.findIndex(r => r.id === reqId)
  if (idx === -1) return res.status(404).json({ error: '요청 없음' })
  db.data.matchRequests.splice(idx, 1)
  await db.write()
  res.status(200).json({})
})

// 5. 멘토 리스트 조회
apiRouter.get('/mentors', auth, async (req, res) => {
  await db.read()
  let mentors = db.data.users.filter(u => u.role === 'mentor')
  const { skill, order_by } = req.query
  if (skill)
    mentors = mentors.filter(m => m.skills && m.skills.some(s => s.toLowerCase().includes(skill.toLowerCase())))
  if (order_by === 'name') mentors.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
  else if (order_by === 'skills') mentors.sort((a, b) => (a.skills?.[0] || '').localeCompare(b.skills?.[0] || ''))
  else mentors.sort((a, b) => a.id - b.id)
  res.status(200).json(
    mentors.map(user => ({
      id: user.id,
      email: user.email,
      role: user.role,
      profile: {
        name: user.name,
        bio: user.bio,
        imageUrl: `/images/mentor/${user.id}`,
        skills: user.skills,
      },
    }))
  )
})

app.use('/api', apiRouter)

app.get('/', (req, res) => {
  res.redirect('/api')
})

app.listen(PORT, () => {
  console.log(`API 서버가 포트 ${PORT}에서 실행 중입니다.`)
})
