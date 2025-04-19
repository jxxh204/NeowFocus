import AskPopup from '@renderer/page/focus/components/Popup/AskPopup'
import CompletedPopup from '@renderer/page/focus/components/Popup/CompletedPopup'
import { createContext, useContext, useState } from 'react'

type PopupProps = {
  children: React.ReactNode
}
type PopupType = 'ask' | 'completed'

const PopupContext = createContext({
  isPopupOpen: false,
  openPopup: (_popup: PopupType) => {},
  closePopup: () => {}
})

export const PopupProvider = ({ children }: PopupProps) => {
  const [popup, setPopup] = useState<PopupType>()
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const openPopup = (popup: PopupType) => {
    setPopup(popup)
    setIsPopupOpen(true)
  }
  const closePopup = () => {
    setIsPopupOpen(false)
    setPopup(undefined)
  }
  return (
    <PopupContext.Provider value={{ isPopupOpen, openPopup, closePopup }}>
      {children}
      {isPopupOpen && popup === 'ask' && <AskPopup />}
      {isPopupOpen && popup === 'completed' && <CompletedPopup />}
    </PopupContext.Provider>
  )
}

export const usePopup = () => {
  const context = useContext(PopupContext)
  if (!context) {
    throw new Error('usePopup must be used within a PopupProvider')
  }
  return context
}
