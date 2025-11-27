import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import Container from '@components/Container'
import Icon from '@renderer/component/ui/Icon'
import MinimizeButton from '@components/MinimizeButton'
import { WINDOW_SIZE, IPC_CHANNELS, ROUTES } from '@renderer/constants'

const SettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  padding: 16px;
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

const ComingSoonBadge = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.color.primary[500]};
  background: rgba(0, 255, 133, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
`

const SETTINGS_BODY_HEIGHT = 280
const SETTINGS_WINDOW_HEIGHT =
  WINDOW_SIZE.TOP_SECTION_HEIGHT + SETTINGS_BODY_HEIGHT + WINDOW_SIZE.BOTTOM_SECTION_HEIGHT

function SettingsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

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
            <ComingSoonBadge>{t('settings.comingSoon')}</ComingSoonBadge>
          </SettingItem>

          <SectionTitle>{t('settings.appearance.title')}</SectionTitle>
          <SettingItem>
            <SettingLabel>{t('settings.appearance.color')}</SettingLabel>
            <ComingSoonBadge>{t('settings.comingSoon')}</ComingSoonBadge>
          </SettingItem>
          <SettingItem>
            <SettingLabel>{t('settings.appearance.icon')}</SettingLabel>
            <ComingSoonBadge>{t('settings.comingSoon')}</ComingSoonBadge>
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
