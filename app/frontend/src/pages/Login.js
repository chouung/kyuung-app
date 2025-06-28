import React, { useState } from 'react'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || '로그인 실패')
      } else {
        const data = await res.json()
        localStorage.setItem('token', data.token)
        window.location.href = '/profile'
      }
    } catch (err) {
      setError('서버 오류')
    } finally {
      setLoading(false)
    }
  }

  const goToSignup = () => {
    window.location.href = '/signup'
  }

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: 24, border: '1px solid #ddd', borderRadius: 8 }}>
      <h2>로그인</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label>
            이메일
            <br />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: 8 }}
            />
          </label>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>
            비밀번호
            <br />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: 8 }}
            />
          </label>
        </div>
        {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
        <button type="submit" style={{ width: '100%', padding: 10, marginBottom: 8 }} disabled={loading}>
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </form>
      <button
        onClick={goToSignup}
        style={{
          width: '100%',
          padding: 10,
          background: '#eee',
          color: '#333',
          border: '1px solid #ccc',
          borderRadius: 4,
        }}
      >
        회원가입 페이지로 이동
      </button>
    </div>
  )
}

export default Login
