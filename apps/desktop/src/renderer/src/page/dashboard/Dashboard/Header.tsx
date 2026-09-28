import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import Icon from '@renderer/component/ui/Icon'
import { Header, HeaderLeft, BackButton, Title } from '../styles'

interface DashboardHeaderProps {
  children: ReactNode
  onBack: () => void
}

function DashboardHeader({ children, onBack }: DashboardHeaderProps) {
  const { t } = useTranslation()

  return (
    <Header>
      <HeaderLeft>
        <BackButton onClick={onBack}>
          <Icon name="undo" size={20} />
        </BackButton>
        <Title>{t('dashboard.title')}</Title>
      </HeaderLeft>
      {children}
    </Header>
  )
}

export default DashboardHeader
