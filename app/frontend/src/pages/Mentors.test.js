import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import Mentors from './Mentors'

describe('Mentors 페이지', () => {
  it('멘토 목록 렌더링 및 검색', () => {
    render(<Mentors />)
    expect(screen.getByText('멘토 목록')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('기술 스택으로 검색')).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'ID순' })).toBeInTheDocument()
    fireEvent.change(screen.getByPlaceholderText('기술 스택으로 검색'), { target: { value: 'React' } })
    expect(screen.getByText('홍길동')).toBeInTheDocument()
  })
})
