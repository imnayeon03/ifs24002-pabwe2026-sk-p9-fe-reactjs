import { useState } from 'react'

// Custom hook state input dua arah: [value, onChange, reset, setValue]
export default function useInput(initial = '') {
  const [value, setValue] = useState(initial)
  const onChange = (event) => setValue(event.target.value)
  const reset = () => setValue(initial)
  return [value, onChange, reset, setValue]
}
