import TextField from '@renderer/component/TextField'

type Props = {
  placeholder: string
  maxLength?: number
  onChangeHandler: (e: React.ChangeEvent<HTMLInputElement>) => void
  value: string
}

const InputTextField = ({ placeholder, maxLength, onChangeHandler, value }: Props) => {
  return (
    <TextField
      placeholder={placeholder}
      maxLength={maxLength}
      hovered={value.length === 0}
      value={value}
      onChange={onChangeHandler}
    />
  )
}

export default InputTextField
