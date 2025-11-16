import styled from 'styled-components'

export const SubButton = styled.button`
  width: 68px;
  height: 26px;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 8px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 0 7.5px;
  transition: background-color 0.2s;

  &:hover {
    background: rgba(0, 0, 0, 0.9);
  }
`
