import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Header, HeaderLeft, Title } from '../styles'

interface DashboardHeaderProps {
  BackButton: ReactNode
  DatePicker: ReactNode
}

function DashboardHeader({ BackButton, DatePicker }: DashboardHeaderProps) {
  const { t } = useTranslation()

  return (
    <Header>
      <HeaderLeft>
        {BackButton}
        <Title>{t('dashboard.title')}</Title>
      </HeaderLeft>
      {DatePicker}
    </Header>
  )
}

export default DashboardHeader
