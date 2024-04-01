import styled from 'styled-components'

const ScreenDragStyle = styled.svg`
  -webkit-app-region: drag;
`

type Props = {
  width: number
  height: number
  mouseMoveHandler: (e: React.MouseEvent<SVGSVGElement>) => void
  mouseUpHandler: () => void
  mouseDownHandler: (e: React.MouseEvent<SVGSVGElement>) => void
}

function ScreenDrag({ width, height, mouseMoveHandler, mouseUpHandler, mouseDownHandler }: Props) {
  return (
    <ScreenDragStyle
      xmlns="http://www.w3.org/2000/svg"
      width={width ? width : 30}
      height={height ? height : 20}
      viewBox="0 0 14 24"
      fill="none"
      onMouseDown={mouseDownHandler}
      onMouseUp={mouseUpHandler}
      onMouseMove={mouseMoveHandler}
    >
      <g clipPath="url(#clip0_786_2245)">
        <path
          d="M5 12C5 11.4477 4.55228 11 4 11C3.44772 11 3 11.4477 3 12C3 12.5523 3.44772 13 4 13C4.55228 13 5 12.5523 5 12Z"
          stroke="#8C8C8C"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5 5C5 4.44772 4.55228 4 4 4C3.44772 4 3 4.44772 3 5C3 5.55228 3.44772 6 4 6C4.55228 6 5 5.55228 5 5Z"
          stroke="#8C8C8C"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5 19C5 18.4477 4.55228 18 4 18C3.44772 18 3 18.4477 3 19C3 19.5523 3.44772 20 4 20C4.55228 20 5 19.5523 5 19Z"
          stroke="#8C8C8C"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M11 12C11 11.4477 10.5523 11 10 11C9.44772 11 9 11.4477 9 12C9 12.5523 9.44772 13 10 13C10.5523 13 11 12.5523 11 12Z"
          stroke="#8C8C8C"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M11 5C11 4.44772 10.5523 4 10 4C9.44772 4 9 4.44772 9 5C9 5.55228 9.44772 6 10 6C10.5523 6 11 5.55228 11 5Z"
          stroke="#8C8C8C"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M11 19C11 18.4477 10.5523 18 10 18C9.44772 18 9 18.4477 9 19C9 19.5523 9.44772 20 10 20C10.5523 20 11 19.5523 11 19Z"
          stroke="#8C8C8C"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_786_2245">
          <rect
            width={width ? width : 30}
            height={height ? height : 20}
            fill="white"
            transform="matrix(0 -1 1 0 0 24)"
          />
        </clipPath>
      </defs>
    </ScreenDragStyle>
  )
}

export default ScreenDrag
