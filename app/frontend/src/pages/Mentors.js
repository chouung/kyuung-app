import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function Mentors() {
  const [mentors, setMentors] = useState([])
  const [search, setSearch] = useState('')
  const [orderBy, setOrderBy] = useState('id')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [myRole, setMyRole] = useState('')
  const [loading, setLoading] = useState(false)
  const [requestingId, setRequestingId] = useState(null)
  const navigate = useNavigate()

  // 내 역할 조회
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    fetch('/api/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setMyRole(data.role || ''))
  }, [])

  // 멘토 목록 조회
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    fetch(
      `/api/mentors?${search ? `skill=${encodeURIComponent(search)}` : ''}${
        orderBy !== 'id' ? `&order_by=${orderBy}` : ''
      }`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setMentors(data)
        else setError('멘토 목록을 불러오지 못했습니다.')
      })
      .catch(() => setError('멘토 목록을 불러오지 못했습니다.'))
  }, [search, orderBy])

  // 매칭 요청
  const handleRequest = async mentorId => {
    setRequestingId(mentorId)
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/match-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mentorId, message: '멘토링 요청합니다!' }),
      })
      if (res.ok) {
        setSuccess('매칭 요청이 전송되었습니다!')
      } else {
        const data = await res.json()
        setError(data.error || '매칭 요청 실패')
      }
    } catch (e) {
      setError('서버 오류')
    } finally {
      setLoading(false)
      setRequestingId(null)
    }
  }

  return (
    <div style={{ maxWidth: 700, margin: '40px auto' }}>
      <button
        type="button"
        style={{
          marginBottom: 20,
          padding: '8px 20px',
          background: '#eee',
          color: '#333',
          border: '1px solid #bbb',
          borderRadius: 4,
        }}
        onClick={() => navigate('/profile')}
      >
        내 프로필로 이동
      </button>
      <h2>멘토 목록</h2>
      <input type="text" placeholder="기술 스택으로 검색" value={search} onChange={e => setSearch(e.target.value)} />
      <select value={orderBy} onChange={e => setOrderBy(e.target.value)}>
        <option value="id">ID순</option>
        <option value="name">이름순</option>
        <option value="skills">기술스택순</option>
      </select>
      {error && <div style={{ color: 'red', margin: '12px 0' }}>{error}</div>}
      {success && <div style={{ color: 'green', margin: '12px 0' }}>{success}</div>}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
        <thead>
          <tr style={{ background: '#f5f5f5' }}>
            <th style={{ border: '1px solid #ddd', padding: 8 }}>이름</th>
            <th style={{ border: '1px solid #ddd', padding: 8 }}>기술스택</th>
            <th style={{ border: '1px solid #ddd', padding: 8 }}>소개</th>
            {myRole === 'mentee' && <th style={{ border: '1px solid #ddd', padding: 8 }}>매칭 요청</th>}
          </tr>
        </thead>
        <tbody>
          {mentors.map(m => (
            <tr key={m.id}>
              <td style={{ border: '1px solid #ddd', padding: 8 }}>{m.profile?.name || m.name}</td>
              <td style={{ border: '1px solid #ddd', padding: 8 }}>
                {(m.profile?.skills || m.skills || []).join(', ')}
              </td>
              <td style={{ border: '1px solid #ddd', padding: 8 }}>{m.profile?.bio || m.bio}</td>
              {myRole === 'mentee' && (
                <td style={{ border: '1px solid #ddd', padding: 8 }}>
                  <button
                    onClick={() => handleRequest(m.id)}
                    disabled={loading && requestingId === m.id}
                    style={{ padding: '6px 16px' }}
                  >
                    {loading && requestingId === m.id ? '요청 중...' : '매칭 요청'}
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Mentors
