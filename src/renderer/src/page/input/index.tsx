import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { useTaskContext } from '@renderer/context/TaskContext'
import Container from '@components/Container'
import Icon from '@renderer/component/ui/Icon'
import MinimizeButton from '@components/MinimizeButton'
import TextField from '@renderer/component/ui/TextField'
import { WINDOW_SIZE, INPUT_LIMITS, ROUTES } from '@renderer/constants'

const TopLeftButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.15s ease;
  -webkit-app-region: no-drag;

  &:hover {
    opacity: 1;
  }
`

function InputPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { startTask } = useTaskContext()
  const [text, setText] = useState('')

  const onSubmitHandler = (e: React.FormEvent) => {
    e.preventDefault()
    if (text.length === 0) return
    startTask(text)
    navigate(ROUTES.FOCUS)
  }

  const onChangeHandler = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    // 줄바꿈(\n) 제거
    const sanitizedValue = newValue.replace(/\n/g, '')
    setText(sanitizedValue)
  }

  const onKeyDownHandler = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onSubmitHandler(e as unknown as React.FormEvent)
    }
  }

  const handleDashboardClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    navigate(ROUTES.DASHBOARD)
  }
  return (
    <Container width={400} onSubmit={onSubmitHandler}>
      <Container.Top height={WINDOW_SIZE.TOP_SECTION_HEIGHT}>
        <TopLeftButtons>
          <Icon name="cat_face" alt="cat" size={24} />
          <IconButton type="button" onClick={handleDashboardClick} title={t('input.dashboard')}>
            <Icon name="chart" size={16} />
          </IconButton>
        </TopLeftButtons>
        <MinimizeButton />
      </Container.Top>
      <Container.Body height={WINDOW_SIZE.BODY_SECTION_HEIGHT} padding="0 12px">
        <TextField
          placeholder={t('input.placeholder')}
          maxLength={INPUT_LIMITS.TASK_NAME_MAX_LENGTH}
          value={text}
          onChange={onChangeHandler}
          onKeyDown={onKeyDownHandler}
        />
      </Container.Body>
      <Container.Bottom height={WINDOW_SIZE.BOTTOM_SECTION_HEIGHT}>
        <Container.Button type="submit" disabled={text.length === 0}>
          {t('input.startButton')}
          <Icon name="timer" alt="timer" size={16} />
        </Container.Button>
      </Container.Bottom>
    </Container>
  )
}

export default InputPage
