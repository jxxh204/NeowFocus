import { useState } from 'react'
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
  onSelect: (date: string) => void
}

function DatePicker({ selectedDate, availableDates, onSelect }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (availableDates.length === 0) {
    return null
  }

  const handleToggle = () => setIsOpen((prev) => !prev)
  const handleClose = () => setIsOpen(false)
  const handleSelect = (date: string) => {
    onSelect(date)
    setIsOpen(false)
  }

  return (
    <>
      <DateSelectorWrapper>
        <DateSelector onClick={handleToggle}>
          {selectedDate ? formatDateDisplay(selectedDate) : ''}
          <Icon name="chevron" size={12} />
        </DateSelector>
        {isOpen && (
          <DatePickerDropdown>
            {availableDates.map((date) => (
              <DateOption
                key={date}
                $isSelected={date === selectedDate}
                onClick={() => handleSelect(date)}
              >
                {formatDateDisplay(date)}
              </DateOption>
            ))}
          </DatePickerDropdown>
        )}
      </DateSelectorWrapper>
      {isOpen && <DatePickerOverlay onClick={handleClose} />}
    </>
  )
}

export default DatePicker
