import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import Login from './Login'

// fetch mocking
beforeEach(() => {
  global.fetch = jest.fn()
})
afterEach(() => {
  jest.resetAllMocks()
})

describe('Login 페이지', () => {
  it('아이디/비밀번호 입력 및 로그인 버튼 렌더링', () => {
    render(<Login />)
    expect(screen.getByText('로그인')).toBeInTheDocument()
    expect(screen.getByLabelText('아이디')).toBeInTheDocument()
    expect(screen.getByLabelText('비밀번호')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument()
  })

  it('로그인 성공 시 토큰 저장 및 /profile 이동', async () => {
    const mockToken = 'test-token'
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: mockToken }),
    })
    delete window.location
    window.location = { href: '' }
    render(<Login />)
    fireEvent.change(screen.getByLabelText('아이디'), { target: { value: 'user' } })
    fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'pass' } })
    fireEvent.click(screen.getByRole('button', { name: '로그인' }))
    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe(mockToken)
      expect(window.location.href).toBe('/profile')
    })
  })

  it('로그인 실패 시 에러 메시지 표시', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: '로그인 실패' }),
    })
    render(<Login />)
    fireEvent.change(screen.getByLabelText('아이디'), { target: { value: 'user' } })
    fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'wrong' } })
    fireEvent.click(screen.getByRole('button', { name: '로그인' }))
    await waitFor(() => {
      expect(screen.getByText('로그인 실패')).toBeInTheDocument()
    })
  })
})
