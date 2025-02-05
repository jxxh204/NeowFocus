import styled from "styled-components";

const ButtonStyle = styled.input`
  border-radius: ${({ theme }) => theme.border.radius};
  width: 100%;
  padding: 16px 12px;
  background-color: white;
  border: 1px solid;
  font-size: 16px;
  cursor: pointer;

  transition: background-color 0.2s;
  background: #000;
  color: #fff;

  &:hover {
    background: ${({ theme }) => theme.color.green[300]};
  }
`;

type Props = {
  type?: "submit";
  onClick?: (e: React.MouseEvent<HTMLInputElement>) => void;
  name: string;
};

function Button({ onClick, type, name }: Props) {
  return (
    <ButtonStyle type={type ? type : "button"} onClick={onClick} value={name} />
  );
}

export default Button;
