import styled from 'styled-components'

const ControlTaskWrap = styled.article`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: end;

  gap: ${({ theme }) => theme.size.gap};
`
const Body = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.size.gap};
`

const ControlTaskName = styled.div`
  border-radius: ${({ theme }) => theme.border.radius};
  border: 1px solid ${({ theme }) => theme.border.color};
  background: #272727;
  color: white;
  padding: 12px 8px;
`
const CountSection = styled.section`
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.size.gap};
`

export { ControlTaskWrap, Body, ControlTaskName, CountSection }
