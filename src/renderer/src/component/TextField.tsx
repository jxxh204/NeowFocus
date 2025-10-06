import styled from 'styled-components'

const InputWrapper = styled.div`
  flex: 1;
  padding: 12px;
  height: 40px;
  display: flex;
  align-items: flex-start;
  background-color: ${({ theme }) => theme.color.input.background};
  border-radius: 12px;
`

const StyledInput = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: ${({ theme }) => theme.color.text.primary};
  font-size: 14px;
  padding: 0;
  line-height: 1.5;

  &::placeholder {
    color: ${({ theme }) => theme.color.input.placeholder};
  }

  &:focus::placeholder {
    opacity: 0.5;
  }
`

type TextFieldProps = {
  placeholder: string
  maxLength?: number
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const TextField = ({ placeholder, maxLength, value, onChange }: TextFieldProps) => {
  return (
    <InputWrapper>
      <StyledInput
        type="text"
        placeholder={placeholder}
        maxLength={maxLength}
        value={value}
        onChange={onChange}
      />
    </InputWrapper>
  )
}

export default TextField
