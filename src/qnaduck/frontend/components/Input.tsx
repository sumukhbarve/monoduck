import React from 'react'
import type { VFC } from 'react'
import { _ } from '../../indeps-qnaduck'

interface InputProps {
  isPw?: boolean
  isOptional?: boolean
  label: string
  value: string
  setValue: (val: string) => void
}
export const Input: VFC<InputProps> = function (props) {
  const { isPw, isOptional, label, value, setValue } = props
  const inputStyle = { width: 320 }
  return (
    <p>
      <input
        type={_.ifel(isPw, 'password', 'text')}
        style={inputStyle}
        placeholder={label}
        value={value}
        onChange={evt => setValue(evt.target.value)}
        required={_.not(isOptional)}
      />
    </p>
  )
}
