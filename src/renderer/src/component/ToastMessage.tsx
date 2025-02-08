import styled from 'styled-components'

interface ToastProps {
  message: string
}

export default function ToastMessage({ message }: ToastProps) {
  return (
    <ToastWrapper>
      <ToastContainer>{message}</ToastContainer>
      <Arrow />
    </ToastWrapper>
  )
}

// Wrapper (위치 정렬)
const ToastWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  margin-right: 8px;
`

const ToastContainer = styled.div`
  background-color: #333;
  color: white;
  font-size: 12px;
  font-weight: 500;
  padding: 8px;
  border-radius: 4px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
`

const Arrow = styled.div`
  width: 0;
  height: 0;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-left: 8px solid #333;
  margin-left: -4px;
`
