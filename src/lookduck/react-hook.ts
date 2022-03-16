import { useState, useEffect } from 'react'
import { Lookable } from './lookable'

const useLookable = function<T> (ob: Lookable<T>): T {
  const [, setBool] = useState(false)
  const rerender = (): void => setBool(bool => !bool)
  useEffect(() => ob.subscribe(rerender), [])
  return ob.get()
}

export { useLookable }
