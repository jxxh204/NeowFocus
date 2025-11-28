import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import Container from '@components/Container'
import Icon from '@renderer/component/ui/Icon'
import MinimizeButton from '@components/MinimizeButton'
import { WINDOW_SIZE, IPC_CHANNELS, ROUTES } from '@renderer/constants'
import {
  useSettingsContext,
  THEME_COLORS,
  TIMER_DURATION_OPTIONS,
  ThemeColorKey
} from '@renderer/context/SettingsContext'

const SettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  padding: 16px;
  overflow-y: auto;
`

const SectionTitle = styled.h2`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.color.text.primary};
  margin: 0;
`

const SettingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: ${({ theme }) => theme.color.input.background};
  border-radius: 8px;
`

const SettingLabel = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.color.text.primary};
`

// 타이머 시간 선택 버튼 그룹
const DurationButtonGroup = styled.div`
  display: flex;
  gap: 6px;
`

const DurationButton = styled.button<{ $isSelected: boolean }>`
  padding: 6px 10px;
  font-size: 12px;
  font-weight: ${({ $isSelected }) => ($isSelected ? 600 : 400)};
  color: ${({ $isSelected, theme }) =>
    $isSelected ? theme.color.black : theme.color.text.primary};
  background: ${({ $isSelected, theme }) =>
    $isSelected ? theme.color.primary[500] : 'transparent'};
  border: 1px solid
    ${({ $isSelected, theme }) =>
      $isSelected ? theme.color.primary[500] : theme.color.container.border};
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: ${({ $isSelected, theme }) =>
      $isSelected ? theme.color.primary[500] : theme.color.button.hover};
  }
`

// 컬러 선택 버튼 그룹
const ColorButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`

const ColorButton = styled.button<{ $color: string; $isSelected: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  border: 2px solid ${({ $isSelected }) => ($isSelected ? '#FFFFFF' : 'transparent')};
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: ${({ $isSelected }) => ($isSelected ? '0 0 0 2px rgba(255,255,255,0.3)' : 'none')};

  &:hover {
    transform: scale(1.1);
  }
`

const SETTINGS_BODY_HEIGHT = 240
const SETTINGS_WINDOW_HEIGHT =
  WINDOW_SIZE.TOP_SECTION_HEIGHT + SETTINGS_BODY_HEIGHT + WINDOW_SIZE.BOTTOM_SECTION_HEIGHT

function SettingsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { settings, timerDurationMinutes, setTimerDuration, setThemeColor } = useSettingsContext()

  useEffect(() => {
    // 설정 페이지 진입 시 윈도우 크기 조정
    window.message?.send(IPC_CHANNELS.WINDOW_SIZE_CHANGE, {
      width: WINDOW_SIZE.DEFAULT_WIDTH,
      height: SETTINGS_WINDOW_HEIGHT
    })
  }, [])

  const handleBack = () => {
    navigate(ROUTES.INPUT)
  }

  return (
    <Container width={400}>
      <Container.Top height={WINDOW_SIZE.TOP_SECTION_HEIGHT}>
        <Icon name="cat_face" alt="cat" size={24} />
        <MinimizeButton />
      </Container.Top>
      <Container.Body height={SETTINGS_BODY_HEIGHT} padding="0">
        <SettingsContainer>
          <SectionTitle>{t('settings.timer.title')}</SectionTitle>
          <SettingItem>
            <SettingLabel>{t('settings.timer.duration')}</SettingLabel>
            <DurationButtonGroup>
              {TIMER_DURATION_OPTIONS.map((minutes) => (
                <DurationButton
                  key={minutes}
                  $isSelected={timerDurationMinutes === minutes}
                  onClick={() => setTimerDuration(minutes)}
                >
                  {minutes}{t('settings.timer.minutes')}
                </DurationButton>
              ))}
            </DurationButtonGroup>
          </SettingItem>

          <SectionTitle>{t('settings.appearance.title')}</SectionTitle>
          <SettingItem>
            <SettingLabel>{t('settings.appearance.color')}</SettingLabel>
            <ColorButtonGroup>
              {(Object.keys(THEME_COLORS) as ThemeColorKey[]).map((colorKey) => (
                <ColorButton
                  key={colorKey}
                  $color={THEME_COLORS[colorKey]}
                  $isSelected={settings.themeColor === colorKey}
                  onClick={() => setThemeColor(colorKey)}
                  title={colorKey}
                />
              ))}
            </ColorButtonGroup>
          </SettingItem>
        </SettingsContainer>
      </Container.Body>
      <Container.Bottom height={WINDOW_SIZE.BOTTOM_SECTION_HEIGHT}>
        <Container.Button type="button" onClick={handleBack}>
          {t('settings.back')}
        </Container.Button>
      </Container.Bottom>
    </Container>
  )
}

export default SettingsPage
