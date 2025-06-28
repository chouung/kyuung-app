import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import Signup from './Signup'

describe('Signup 페이지', () => {
  it('회원가입 폼 렌더링 및 입력', () => {
    render(<Signup />)
    expect(screen.getByText('회원가입')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('이메일')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('비밀번호')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('이름')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '회원가입' })).toBeInTheDocument()
    fireEvent.change(screen.getByPlaceholderText('이메일'), { target: { value: 'test@email.com' } })
    fireEvent.change(screen.getByPlaceholderText('비밀번호'), { target: { value: 'pw1234' } })
    fireEvent.change(screen.getByPlaceholderText('이름'), { target: { value: '홍길동' } })
    fireEvent.change(screen.getByDisplayValue('mentee'), { target: { value: 'mentor' } })
    expect(screen.getByDisplayValue('mentor')).toBeInTheDocument()
  })
})
