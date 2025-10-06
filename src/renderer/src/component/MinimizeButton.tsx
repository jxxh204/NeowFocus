import styled from 'styled-components'

const ButtonWrapper = styled.button`
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background 0.2s;
  -webkit-app-region: no-drag;

  &:hover {
    background: ${({ theme }) => theme.color.button.iconHover};
  }
`

const MinimizeLine = styled.div`
  width: 11px;
  height: 2px;
  background: ${({ theme }) => theme.color.text.primary};
  opacity: 0.6;
`

const MinimizeButton = () => {
  const handleMinimize = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    window.electron.minimizeWindow()
  }

  return (
    <ButtonWrapper type="button" onClick={handleMinimize}>
      <MinimizeLine />
    </ButtonWrapper>
  )
}

export default MinimizeButton
