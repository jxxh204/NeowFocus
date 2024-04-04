import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

const CompleteModalStyle = styled.div`
  top: 0;
  left: 0;
  position: fixed;
  border: none;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  z-index: 999;

  p {
    color: #fff;
    font-size: 18px;
    font-style: normal;
    font-weight: 400;
    line-height: 28px; /* 140% */
  }
`

const Icon = styled.div`
  font-size: 44px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
`

type Props = {
  isOpen: boolean
}

function CompleteModal({ isOpen }: Props) {
  if (!isOpen) return null
  // const [open, setOpen] = useState(true)
  const navigate = useNavigate()
  useEffect(() => {
    console.log('🚀 ~ useEffect ~ useEffect: Complete')
    setTimeout(() => {
      // setOpen(false)
      navigate('/')
    }, 1000)
  }, [])
  // if (open)
  return (
    <CompleteModalStyle>
      <Icon>🎉</Icon>
      <p>집중해서 끝내셨군요.</p>
      <p>대단해요!</p>
    </CompleteModalStyle>
  )
}

export default CompleteModal
