import Icon from '@renderer/component/ui/Icon'
import { formatDateDisplay } from './useDashboard'
import {
  DateSelectorWrapper,
  DateSelector,
  DatePickerDropdown,
  DateOption,
  DatePickerOverlay
} from './styles'

interface DatePickerProps {
  selectedDate: string
  availableDates: string[]
  showDatePicker: boolean
  onToggle: () => void
  onSelect: (date: string) => void
  onClose: () => void
}

function DatePicker({
  selectedDate,
  availableDates,
  showDatePicker,
  onToggle,
  onSelect,
  onClose
}: DatePickerProps) {
  if (availableDates.length === 0) {
    return null
  }

  return (
    <>
      <DateSelectorWrapper>
        <DateSelector onClick={onToggle}>
          {selectedDate ? formatDateDisplay(selectedDate) : ''}
          <Icon name="chevron" size={12} />
        </DateSelector>
        {showDatePicker && (
          <DatePickerDropdown>
            {availableDates.map((date) => (
              <DateOption
                key={date}
                $isSelected={date === selectedDate}
                onClick={() => onSelect(date)}
              >
                {formatDateDisplay(date)}
              </DateOption>
            ))}
          </DatePickerDropdown>
        )}
      </DateSelectorWrapper>
      {showDatePicker && <DatePickerOverlay onClick={onClose} />}
    </>
  )
}

export default DatePicker
