import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Icon from '@renderer/component/ui/Icon'
import DatePicker from '../DatePicker'
import { Header, HeaderLeft, BackButton, Title } from '../styles'

interface DashboardHeaderProps {
  onBack: () => void
  selectedDate: string
  availableDates: string[]
  onSelectDate: (date: string) => void
}

function DashboardHeader({
  onBack,
  selectedDate,
  availableDates,
  onSelectDate
}: DashboardHeaderProps) {
  const { t } = useTranslation()
  const [showDatePicker, setShowDatePicker] = useState(false)

  const handleToggle = () => setShowDatePicker((prev) => !prev)
  const handleClose = () => setShowDatePicker(false)
  const handleSelect = (date: string) => {
    onSelectDate(date)
    setShowDatePicker(false)
  }

  return (
    <Header>
      <HeaderLeft>
        <BackButton onClick={onBack}>
          <Icon name="undo" size={20} />
        </BackButton>
        <Title>{t('dashboard.title')}</Title>
      </HeaderLeft>
      <DatePicker
        selectedDate={selectedDate}
        availableDates={availableDates}
        showDatePicker={showDatePicker}
        onToggle={handleToggle}
        onSelect={handleSelect}
        onClose={handleClose}
      />
    </Header>
  )
}

export default DashboardHeader
