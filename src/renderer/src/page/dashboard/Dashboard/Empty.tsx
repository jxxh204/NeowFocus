import { useTranslation } from 'react-i18next'
import Icon from '@renderer/component/ui/Icon'
import { EmptyMessage } from '../styles'

function DashboardEmpty() {
  const { t } = useTranslation()

  return (
    <EmptyMessage>
      <Icon name="paw_white" size={40} />
      {t('dashboard.empty')}
    </EmptyMessage>
  )
}

export default DashboardEmpty
