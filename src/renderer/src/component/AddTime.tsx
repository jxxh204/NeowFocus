import styled from 'styled-components'

const AddTimeStyle = styled.div<{ $size: number }>`
  position: relative;
  width: ${(props) => props.$size};
  height: ${(props) => props.$size};
  svg {
    stroke: #d9d9d9;
  }
  path {
    // 시계
    stroke: #3f3f3f;
  }
`
const Icon = styled.svg`
  position: absolute;
  left: 50%;
  top: 47%;
  transform: translate(-50%, -50%);
`
const Cycle = styled.svg``

function AddTime({ size }: { size: number }) {
  return (
    <AddTimeStyle $size={size * 2}>
      <Cycle
        xmlns="http://www.w3.org/2000/svg"
        width={size * 2}
        height={size * 2}
        viewBox="0 0 54 54"
        fill="none"
      >
        <circle cx="27" cy="27" r="25" stroke-width="4" />
      </Cycle>
      <Icon
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M12 21C16.4183 21 20 17.4183 20 13C20 8.58172 16.4183 5 12 5C7.58172 5 4 8.58172 4 13C4 17.4183 7.58172 21 12 21Z"
          stroke="#D9D9D9"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M5 3L2 6"
          stroke="#D9D9D9"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M22 6L19 3"
          stroke="#D9D9D9"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M6.38 18.7002L4 21.0002"
          stroke="#D9D9D9"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M17.6399 18.6699L19.9999 20.9999"
          stroke="#D9D9D9"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M12 10V16"
          stroke="#D9D9D9"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M9 13H15"
          stroke="#D9D9D9"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </Icon>
    </AddTimeStyle>
  )
}

export default AddTime
