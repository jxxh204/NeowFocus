import { FormEventHandler, ReactNode } from "react";
import styled from "styled-components";

const MainStyle = styled.form`
  display: flex;
  flex-direction: column;
  margin-top: ${({ theme }) => theme.size.gap};

  gap: ${({ theme }) => theme.size.gap};
`;

type Props = {
  children: ReactNode;
  onSubmit: FormEventHandler<HTMLFormElement>;
};
function Main({ children, onSubmit }: Props) {
  return <MainStyle onSubmit={onSubmit}>{children}</MainStyle>;
}

export default Main;
