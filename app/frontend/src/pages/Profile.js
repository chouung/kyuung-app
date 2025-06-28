import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function Profile() {
  const [profile, setProfile] = useState({
    name: '',
    bio: '',
    role: 'mentee',
    image: '',
    skills: '', // mentor일 때만 사용
  })
  const [imageFile, setImageFile] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [imagePreview, setImagePreview] = useState('')
  const navigate = useNavigate()

  // 내 정보 조회 (GET /api/me)
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    fetch('/api/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (data.profile) {
          setProfile({
            name: data.profile.name || '',
            bio: data.profile.bio || '',
            role: data.role || 'mentee',
            image: '',
            skills: data.profile.skills ? data.profile.skills.join(',') : '',
          })
          // 이미지 미리보기 설정 (imageUrl이 있으면)
          if (data.profile.imageUrl) {
            setImagePreview(data.profile.imageUrl)
          } else {
            setImagePreview('')
          }
        }
      })
  }, [])

  const handleChange = e => {
    const { name, value } = e.target
    setProfile(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = e => {
    const file = e.target.files[0]
    setImageFile(file)
    if (file) {
      const reader = new FileReader()
      reader.onload = ev => {
        setImagePreview(ev.target.result)
      }
      reader.readAsDataURL(file)
    } else {
      setImagePreview('')
    }
  }

  // 프로필 저장 (PUT /api/profile)
  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('로그인 필요')
      let imageBase64
      if (imageFile) {
        const reader = new FileReader()
        imageBase64 = await new Promise(resolve => {
          reader.onload = () => resolve(reader.result.split(',')[1])
          reader.readAsDataURL(imageFile)
        })
      }
      const body = {
        name: profile.name,
        bio: profile.bio,
        // imageFile이 있을 때만 image 필드 포함
        ...(imageFile ? { image: imageBase64 } : {}),
        ...(profile.role === 'mentor' && profile.skills
          ? {
              skills: profile.skills
                .split(',')
                .map(s => s.trim())
                .filter(Boolean),
            }
          : {}),
      }
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        setSuccess('프로필이 저장되었습니다!')
        // 저장 후 최신 프로필 다시 불러오기
        const meRes = await fetch('/api/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const meData = await meRes.json()
        if (meData.profile) {
          setProfile({
            name: meData.profile.name || '',
            bio: meData.profile.bio || '',
            role: meData.role || 'mentee',
            image: '',
            skills: meData.profile.skills ? meData.profile.skills.join(',') : '',
          })
          if (meData.profile.imageUrl) {
            setImagePreview(meData.profile.imageUrl)
          } else {
            setImagePreview('')
          }
        }
      } else {
        const data = await res.json()
        setError(data.error || '프로필 저장 실패')
      }
    } catch (err) {
      setError('서버 오류 또는 로그인 필요')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ maxWidth: 400, margin: '40px auto', padding: 24, border: '1px solid #ddd', borderRadius: 8 }}
    >
      <h2>프로필</h2>
      {/* 이미지 미리보기 */}
      {imagePreview && (
        <img
          src={imagePreview}
          alt="프로필 이미지 미리보기"
          style={{
            width: 120,
            height: 120,
            objectFit: 'cover',
            borderRadius: '50%',
            marginBottom: 16,
            display: 'block',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        />
      )}
      <input
        type="text"
        name="name"
        placeholder="이름"
        value={profile.name}
        onChange={handleChange}
        required
        style={{ width: '100%', marginBottom: 12, padding: 8 }}
      />
      <textarea
        name="bio"
        placeholder="소개글"
        value={profile.bio}
        onChange={handleChange}
        required
        style={{ width: '100%', marginBottom: 12, padding: 8 }}
      />
      <select
        name="role"
        value={profile.role}
        onChange={handleChange}
        style={{ width: '100%', marginBottom: 12, padding: 8 }}
      >
        <option value="mentor">멘토</option>
        <option value="mentee">멘티</option>
      </select>
      {profile.role === 'mentor' && (
        <input
          type="text"
          name="skills"
          placeholder="기술 스택 (쉼표로 구분)"
          value={profile.skills}
          onChange={handleChange}
          style={{ width: '100%', marginBottom: 12, padding: 8 }}
        />
      )}
      <input type="file" accept=".jpg,.png" onChange={handleImageChange} style={{ width: '100%', marginBottom: 12 }} />
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
      {success && <div style={{ color: 'green', marginBottom: 12 }}>{success}</div>}
      <button type="submit" style={{ width: '100%', padding: 10 }} disabled={loading}>
        {loading ? '저장 중...' : '프로필 저장'}
      </button>
      <button
        type="button"
        style={{
          width: '100%',
          padding: 10,
          marginBottom: 12,
          background: '#eee',
          color: '#333',
          border: '1px solid #bbb',
          borderRadius: 4,
        }}
        onClick={() => navigate('/mentors')}
      >
        멘토 목록 보기
      </button>
    </form>
  )
}

export default Profile
