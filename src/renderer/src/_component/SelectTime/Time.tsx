import styled from "styled-components";
import { useSelectTimerContext } from "./context";

const TimeInput = styled.input`
  display: none;

  &:checked + span {
    background-color: ${({ theme }) => theme.color.green[300]};
  }
`;
const TimeLabel = styled.label`
  display: flex;
  border-radius: ${({ theme }) => theme.border.radius};

  &:hover {
    background: ${({ theme }) => theme.color.green[300]};
  }
  span {
    border-radius: ${({ theme }) => theme.border.radius};
    padding: 10px 42px;
    background-color: white;
    border: 1px solid;
    font-size: 16px;

    transition: background-color 0.2s;
    cursor: pointer;
  }
`;

type Props = {
  children: string;
  value: string;
};

function Time({ children, value }: Props) {
  const { onChange, name } = useSelectTimerContext();
  return (
    <TimeLabel>
      <TimeInput
        type="radio"
        name={name}
        value={value}
        onChange={onChange ? onChange : undefined}
      />
      <span>{children}</span>
    </TimeLabel>
  );
}

export default Time;
