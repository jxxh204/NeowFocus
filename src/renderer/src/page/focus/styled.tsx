import styled from 'styled-components'

const DefaultTaskWrap = styled.article`
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.size.gap};
`

const TaskName = styled.div`
  border-radius: ${({ theme }) => theme.border.radius};
  border: 1px solid ${({ theme }) => theme.border.color};
  background: #272727;
  color: white;
  padding: 10px 8px;
  width: 100%;
`
const ModeChangeArea = styled.section`
  display: flex;
  flex-direction: row;
  width: 100%;
  cursor: pointer;
  gap: ${({ theme }) => theme.size.gap};
`

export { DefaultTaskWrap, TaskName, ModeChangeArea }
