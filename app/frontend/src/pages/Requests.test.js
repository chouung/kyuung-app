import React from 'react'
import { render, screen } from '@testing-library/react'
import Requests from './Requests'

describe('Requests 페이지', () => {
  it('매칭 요청 관련 UI 렌더링', () => {
    render(<Requests />)
    expect(screen.getByText('매칭 요청')).toBeInTheDocument()
  })
})
