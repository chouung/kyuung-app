import React, { useEffect, useState } from 'react'

const API = '/api/match-requests'

function Requests() {
  const [outgoing, setOutgoing] = useState([])
  const [incoming, setIncoming] = useState([])
  const [mentorId, setMentorId] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const token = localStorage.getItem('token') // JWT 토큰 저장 위치에 따라 수정

  // API 요청 공통 옵션
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {}

  // 내가 보낸 요청 목록 (멘티)
  const fetchOutgoing = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/outgoing`, { headers: authHeader })
      if (res.ok) {
        setOutgoing(await res.json())
      }
    } finally {
      setLoading(false)
    }
  }

  // 받은 요청 목록 (멘토)
  const fetchIncoming = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/incoming`, { headers: authHeader })
      if (res.ok) {
        setIncoming(await res.json())
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOutgoing()
    fetchIncoming()
  }, [])

  // 매칭 요청 보내기 (멘티)
  const handleSend = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { ...authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify({ mentorId: Number(mentorId), message }),
      })
      if (res.ok) {
        setMentorId('')
        setMessage('')
        fetchOutgoing()
      } else {
        alert('매칭 요청 실패')
      }
    } finally {
      setLoading(false)
    }
  }

  // 요청 취소 (멘티)
  const handleCancel = async id => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/${id}`, {
        method: 'DELETE',
        headers: authHeader,
      })
      if (res.ok) fetchOutgoing()
    } finally {
      setLoading(false)
    }
  }

  // 요청 수락/거절 (멘토)
  const handleAccept = async id => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/${id}/accept`, {
        method: 'PUT',
        headers: authHeader,
      })
      if (res.ok) fetchIncoming()
    } finally {
      setLoading(false)
    }
  }
  const handleReject = async id => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/${id}/reject`, {
        method: 'PUT',
        headers: authHeader,
      })
      if (res.ok) fetchIncoming()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 700, margin: '40px auto' }}>
      <h2>매칭 요청</h2>
      {/* 멘티: 매칭 요청 보내기 폼 */}
      <form onSubmit={handleSend} style={{ marginBottom: 24 }}>
        <input
          type="text"
          placeholder="멘토 ID"
          value={mentorId}
          onChange={e => setMentorId(e.target.value)}
          required
          style={{ marginRight: 8 }}
        />
        <input
          type="text"
          placeholder="메시지"
          value={message}
          onChange={e => setMessage(e.target.value)}
          required
          style={{ marginRight: 8 }}
        />
        <button type="submit" disabled={loading} style={{ padding: '6px 16px' }}>
          매칭 요청 보내기
        </button>
      </form>

      {/* 멘티: 내가 보낸 요청 목록 */}
      <h3>내가 보낸 요청</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
        <thead>
          <tr style={{ background: '#f5f5f5' }}>
            <th style={{ border: '1px solid #ddd', padding: 8 }}>멘토</th>
            <th style={{ border: '1px solid #ddd', padding: 8 }}>메시지</th>
            <th style={{ border: '1px solid #ddd', padding: 8 }}>상태</th>
            <th style={{ border: '1px solid #ddd', padding: 8 }}>취소</th>
          </tr>
        </thead>
        <tbody>
          {outgoing.map(req => (
            <tr key={req.id}>
              <td style={{ border: '1px solid #ddd', padding: 8 }}>{req.mentorName || req.mentorId}</td>
              <td style={{ border: '1px solid #ddd', padding: 8 }}>{req.message}</td>
              <td style={{ border: '1px solid #ddd', padding: 8 }}>{req.status}</td>
              <td style={{ border: '1px solid #ddd', padding: 8 }}>
                {req.status === 'pending' && (
                  <button onClick={() => handleCancel(req.id)} disabled={loading} style={{ padding: '4px 12px' }}>
                    취소
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 멘토: 받은 요청 목록 */}
      <h3>나에게 온 요청</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f5f5f5' }}>
            <th style={{ border: '1px solid #ddd', padding: 8 }}>멘티</th>
            <th style={{ border: '1px solid #ddd', padding: 8 }}>메시지</th>
            <th style={{ border: '1px solid #ddd', padding: 8 }}>상태</th>
            <th style={{ border: '1px solid #ddd', padding: 8 }}>수락/거절</th>
          </tr>
        </thead>
        <tbody>
          {incoming.map(req => (
            <tr key={req.id}>
              <td style={{ border: '1px solid #ddd', padding: 8 }}>{req.menteeName || req.menteeId}</td>
              <td style={{ border: '1px solid #ddd', padding: 8 }}>{req.message}</td>
              <td style={{ border: '1px solid #ddd', padding: 8 }}>{req.status}</td>
              <td style={{ border: '1px solid #ddd', padding: 8 }}>
                {req.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleAccept(req.id)}
                      disabled={loading}
                      style={{ padding: '4px 12px', marginRight: 4 }}
                    >
                      수락
                    </button>
                    <button onClick={() => handleReject(req.id)} disabled={loading} style={{ padding: '4px 12px' }}>
                      거절
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Requests
