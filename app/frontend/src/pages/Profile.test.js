import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import Profile from './Profile'

describe('Profile 페이지', () => {
  it('프로필 폼 렌더링 및 입력', () => {
    render(<Profile />)
    expect(screen.getByText('프로필')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('이름')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('소개글')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '프로필 저장' })).toBeInTheDocument()
    fireEvent.change(screen.getByPlaceholderText('이름'), { target: { value: '홍길동' } })
    fireEvent.change(screen.getByPlaceholderText('소개글'), { target: { value: '안녕하세요' } })
    fireEvent.change(screen.getByDisplayValue('mentee'), { target: { value: 'mentor' } })
    expect(screen.getByDisplayValue('mentor')).toBeInTheDocument()
  })
})
