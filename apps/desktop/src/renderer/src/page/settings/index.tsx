import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import Container from '@components/Container'
import Icon from '@renderer/component/ui/Icon'
import { WINDOW_SIZE, ROUTES } from '@renderer/constants'
import { useTaskContext } from '@renderer/context/TaskContext'
import {
  useSettingsContext,
  THEME_COLORS,
  TIMER_DURATION_OPTIONS,
  ThemeColorKey,
  superFocusScene,
  type SuperFocusCat,
  type SuperFocusRoom
} from '@renderer/context/SettingsContext'
import roomDefault from '@renderer/page/superfocus/assets/workroom-still.png'
import roomNature from '@renderer/page/superfocus/assets/worlds/room-nature.png'
import roomScrapyard from '@renderer/page/superfocus/assets/worlds/room-scrapyard.png'
import catGray from '@renderer/page/superfocus/assets/worlds/cat-gray.png'
import catBritish from '@renderer/page/superfocus/assets/worlds/cat-british.png'
import catSiamese from '@renderer/page/superfocus/assets/worlds/cat-siamese.png'
import catMaine from '@renderer/page/superfocus/assets/worlds/cat-maine.png'

const ROOM_CHOICES: { id: SuperFocusRoom; label: string; image: string }[] = [
  { id: 'default', label: '기본 작업실', image: roomDefault },
  { id: 'nature', label: '햇살과 초록 폐허', image: roomNature },
  { id: 'scrapyard', label: '폐차장 속 피난처', image: roomScrapyard }
]

const CAT_CHOICES: { id: SuperFocusCat; label: string; image: string }[] = [
  { id: 'gray', label: '회색 고양이', image: catGray },
  { id: 'british', label: '브리티시', image: catBritish },
  { id: 'siamese', label: '샴', image: catSiamese },
  { id: 'maine', label: '메인쿤', image: catMaine }
]

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

const Toggle = styled.button`
  width: 38px;
  height: 23px;
  padding: 3px;
  flex-shrink: 0;
  border: none;
  border-radius: 12px;
  background: ${({ theme }) => theme.color.gray[500]};
  cursor: pointer;
  &::before {
    content: '';
    display: block;
    width: 17px;
    height: 17px;
    border-radius: 50%;
    background: white;
  }
  &[aria-checked='true'] {
    background: ${({ theme }) => theme.color.primary[500]};
  }
  &[aria-checked='true']::before {
    transform: translateX(15px);
    background: ${({ theme }) => theme.color.black};
  }
`

const Detail = styled.p`
  margin: 6px 0 0;
  color: ${({ theme }) => theme.color.text.muted};
  font-size: 11px;
  line-height: 16px;
`

const Retry = styled.button`
  margin-top: 6px;
  padding: 0;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.color.text.primary};
  text-decoration: underline;
  cursor: pointer;
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

const SceneItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  background: ${({ theme }) => theme.color.input.background};
  border-radius: 8px;
`

const RoomGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
`

const RoomButton = styled.button<{ $isSelected: boolean }>`
  padding: 0;
  border: 0;
  background: transparent;
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: left;
  font-size: 12px;
  font-weight: ${({ $isSelected }) => ($isSelected ? 600 : 400)};
  color: ${({ theme }) => theme.color.text.primary};
  cursor: pointer;

  img {
    width: 100%;
    aspect-ratio: 16 / 9;
    object-fit: cover;
    border-radius: 8px;
    box-sizing: border-box;
    border: 2px solid
      ${({ $isSelected, theme }) => ($isSelected ? theme.color.primary[500] : 'transparent')};
  }
`

const CatRow = styled.div`
  display: flex;
  gap: 6px;
`

const CatButton = styled.button<{ $isSelected: boolean }>`
  flex: 1 1 0;
  min-height: 60px;
  padding: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  font-size: 11px;
  font-weight: ${({ $isSelected }) => ($isSelected ? 600 : 400)};
  color: ${({ theme }) => theme.color.text.primary};
  background: ${({ $isSelected }) => ($isSelected ? 'rgba(0, 255, 133, 0.1)' : 'transparent')};
  border: 1px solid
    ${({ $isSelected, theme }) =>
      $isSelected ? theme.color.primary[500] : theme.color.container.border};
  border-radius: 6px;
  cursor: pointer;

  &:disabled {
    opacity: 0.35;
    cursor: default;
  }

  img {
    width: 56px;
    height: 28px;
    object-fit: contain;
  }
`

const SETTINGS_TOP_SECTION_HEIGHT = 16
const SETTINGS_BODY_HEIGHT = 540

function SettingsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { settings, timerDurationMinutes, setTimerDuration, setThemeColor, updateExperience } =
    useSettingsContext()
  const { room: superFocusRoom, cat: superFocusCat } = superFocusScene(settings)
  const { syncEnabled, syncStatus, setSyncEnabled, retrySync, updateDraft } = useTaskContext()

  const handleBack = () => {
    navigate(ROUTES.INPUT)
  }

  return (
    <Container width={WINDOW_SIZE.DEFAULT_WIDTH}>
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
                    onClick={() => {
                      setTimerDuration(minutes)
                      updateDraft({ minutes })
                    }}
                  >
                    {minutes}
                    {t('settings.timer.minutes')}
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
            <SectionTitle>슈퍼포커스</SectionTitle>
            <SceneItem>
              <SettingLabel id="room-label">작업실</SettingLabel>
              <RoomGrid role="radiogroup" aria-labelledby="room-label">
                {ROOM_CHOICES.map((room) => (
                  <RoomButton
                    key={room.id}
                    type="button"
                    role="radio"
                    aria-checked={superFocusRoom === room.id}
                    $isSelected={superFocusRoom === room.id}
                    onClick={() => updateExperience({ superFocusRoom: room.id })}
                  >
                    <img src={room.image} alt="" />
                    {room.label}
                  </RoomButton>
                ))}
              </RoomGrid>
            </SceneItem>
            <SceneItem>
              <SettingLabel id="cat-label">고양이</SettingLabel>
              <CatRow role="radiogroup" aria-labelledby="cat-label">
                {CAT_CHOICES.map((cat) => (
                  <CatButton
                    key={cat.id}
                    type="button"
                    role="radio"
                    aria-checked={superFocusCat === cat.id}
                    disabled={superFocusRoom === 'default' && cat.id !== 'gray'}
                    $isSelected={superFocusCat === cat.id}
                    onClick={() => updateExperience({ superFocusCat: cat.id })}
                  >
                    <img src={cat.image} alt="" />
                    {cat.label}
                  </CatButton>
                ))}
              </CatRow>
              <Detail>
                {superFocusRoom === 'default'
                  ? '기본 작업실에는 회색 고양이가 함께 그려져 있어요. 다른 고양이는 다른 작업실에서 고를 수 있어요.'
                  : '슈퍼포커스를 열면 고른 작업실에서 집중해요.'}
              </Detail>
            </SceneItem>
            <SectionTitle>연결 및 알림</SectionTitle>
            <SettingItem>
              <div>
                <SettingLabel id="sync-label">iCloud 동기화</SettingLabel>
                <Detail aria-live="polite">
                  {!syncEnabled
                    ? '이 Mac에만 저장'
                    : syncStatus === 'offline'
                      ? '연결할 수 없어요. 기록은 이 Mac에 보관돼요.'
                      : syncStatus === 'connecting'
                        ? '연결 중…'
                        : 'iPhone과 집중·기록을 함께 사용해요.'}
                </Detail>
                {syncEnabled && syncStatus === 'offline' && (
                  <Retry type="button" onClick={retrySync}>
                    다시 시도
                  </Retry>
                )}
              </div>
              <Toggle
                type="button"
                role="switch"
                aria-labelledby="sync-label"
                aria-checked={syncEnabled}
                onClick={() => setSyncEnabled(!syncEnabled)}
              />
            </SettingItem>
            <SettingItem>
              <SettingLabel id="alerts-label">완료 소리·진동</SettingLabel>
              <Toggle
                type="button"
                role="switch"
                aria-labelledby="alerts-label"
                aria-checked={settings.alerts !== false}
                onClick={() => updateExperience({ alerts: settings.alerts === false })}
              />
            </SettingItem>
            <SettingItem>
              <div>
                <SettingLabel id="break-label">집중 후 10분 휴식</SettingLabel>
                <Detail>켜두면 집중을 마친 뒤 자동으로 쉬어요.</Detail>
              </div>
              <Toggle
                type="button"
                role="switch"
                aria-labelledby="break-label"
                aria-checked={settings.autoBreak === true}
                onClick={() => updateExperience({ autoBreak: settings.autoBreak !== true })}
              />
            </SettingItem>
            <SettingItem
              as="button"
              type="button"
              onClick={() => navigate('/blocking')}
              style={{ border: 0, cursor: 'pointer' }}
            >
              <SettingLabel>집중 중 사이트 차단</SettingLabel>
              <Icon name="chevron" size={16} />
            </SettingItem>
          </SettingsContent>
        </SettingsWrapper>
      </Container.Body>
    </Container>
  )
}

export default SettingsPage
