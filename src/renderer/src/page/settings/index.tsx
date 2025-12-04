import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import Container from '@components/Container'
import Icon from '@renderer/component/ui/Icon'
import { WINDOW_SIZE, IPC_CHANNELS, ROUTES } from '@renderer/constants'
import {
  useSettingsContext,
  THEME_COLORS,
  TIMER_DURATION_OPTIONS,
  ThemeColorKey
} from '@renderer/context/SettingsContext'

const SettingsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  height: 100%;
  padding: 0 12px 12px 12px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.color.text.secondary};
    border-radius: 2px;
  }
`

const Header = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 0;
  flex-shrink: 0;
`

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const BackButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 24px;
  color: ${({ theme }) => theme.color.text.primary};
  padding: 0;

  &:hover {
    opacity: 0.7;
  }
`

const Title = styled.h1`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.color.text.primary};
  margin: 0;
`

const SettingsContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
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

const SETTINGS_TOP_SECTION_HEIGHT = 16
const SETTINGS_BODY_HEIGHT = 230
const SETTINGS_WINDOW_HEIGHT = SETTINGS_TOP_SECTION_HEIGHT + SETTINGS_BODY_HEIGHT

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
      <Container.Top height={SETTINGS_TOP_SECTION_HEIGHT}>
        <div />
      </Container.Top>
      <Container.Body height={SETTINGS_BODY_HEIGHT} padding="0">
        <SettingsWrapper>
          <Header>
            <HeaderLeft>
              <BackButton onClick={handleBack}>
                <Icon name="undo" size={20} />
              </BackButton>
              <Title>{t('settings.title')}</Title>
            </HeaderLeft>
          </Header>
          <SettingsContent>
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
          </SettingsContent>
        </SettingsWrapper>
      </Container.Body>
    </Container>
  )
}

export default SettingsPage
