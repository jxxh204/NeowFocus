import styled from 'styled-components'
import menu from '../asset/MenuIcon.svg'
type Props = {
  name?: string
}

const HeaderStyle = styled.header`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  h2 {
    font-weight: bold;
  }
`

function Header({ name }: Props) {
  return (
    <HeaderStyle>
      {name ? <h2>{name}</h2> : null}

      <img src={menu} />
    </HeaderStyle>
  )
}

export default Header
