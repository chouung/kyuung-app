import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Mentors from './pages/Mentors'
import Requests from './pages/Requests'

function Header() {
  const navigate = useNavigate()
  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login', { replace: true })
  }
  const isLoggedIn = !!localStorage.getItem('token')
  return (
    <header
      style={{
        width: '100%',
        background: '#f5f5f5',
        padding: '12px 0',
        marginBottom: 24,
        borderBottom: '1px solid #ddd',
      }}
    >
      <div
        style={{
          maxWidth: 900,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <Link to="/mentors" style={{ marginRight: 16, textDecoration: 'none', color: '#333', fontWeight: 600 }}>
            멘토목록
          </Link>
          <Link to="/profile" style={{ marginRight: 16, textDecoration: 'none', color: '#333', fontWeight: 600 }}>
            내프로필
          </Link>
          <Link to="/requests" style={{ textDecoration: 'none', color: '#333', fontWeight: 600 }}>
            매칭요청
          </Link>
        </div>
        {isLoggedIn && (
          <button
            onClick={handleLogout}
            style={{
              padding: '6px 18px',
              background: '#eee',
              border: '1px solid #bbb',
              borderRadius: 4,
              fontWeight: 600,
            }}
          >
            로그아웃
          </button>
        )}
      </div>
    </header>
  )
}

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/mentors" element={<Mentors />} />
        <Route path="/requests" element={<Requests />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}

export default App
