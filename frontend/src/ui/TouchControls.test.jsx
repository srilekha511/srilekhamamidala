import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TouchControls from './TouchControls.jsx'

describe('TouchControls', () => {
  it('holds direction while pressed and releases on up, leave, or cancel', () => {
    const onPress = vi.fn(), onRelease = vi.fn()
    render(<TouchControls onPress={onPress} onRelease={onRelease} />)
    const left = screen.getByRole('button', { name: /walk left/i })
    fireEvent.pointerDown(left); expect(onPress).toHaveBeenLastCalledWith('left')
    fireEvent.pointerUp(left); expect(onRelease).toHaveBeenLastCalledWith('left')
    const right = screen.getByRole('button', { name: /walk right/i })
    fireEvent.pointerDown(right); fireEvent.pointerLeave(right)
    expect(onRelease).toHaveBeenLastCalledWith('right')
    fireEvent.pointerDown(right); fireEvent.pointerCancel(right)
    expect(onRelease).toHaveBeenCalledTimes(3)
  })
  it('A button interacts', () => {
    const onPress = vi.fn(), onRelease = vi.fn()
    render(<TouchControls onPress={onPress} onRelease={onRelease} />)
    const a = screen.getByRole('button', { name: /interact/i })
    fireEvent.pointerDown(a); fireEvent.pointerUp(a)
    expect(onPress).toHaveBeenCalledWith('interact')
    expect(onRelease).toHaveBeenCalledWith('interact')
  })
})
