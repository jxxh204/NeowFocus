import styled from 'styled-components'

export const DashboardContainer = styled.div`
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

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  flex-shrink: 0;
`

export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

export const BackButton = styled.button`
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

export const Title = styled.h1`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.color.text.primary};
  margin: 0;
`

export const DateSelectorWrapper = styled.div`
  position: relative;
`

export const DateSelector = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: ${({ theme }) => theme.color.input.background};
  border: 1px solid ${({ theme }) => theme.color.container.border};
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  color: ${({ theme }) => theme.color.text.primary};

  &:hover {
    background: ${({ theme }) => theme.color.button.hover};
  }
`

export const DateArrow = styled.span`
  font-size: 10px;
  color: ${({ theme }) => theme.color.text.secondary};
`

export const TaskCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px 16px;
  background: ${({ theme }) => theme.color.input.background};
  border-radius: 12px;
`

export const TaskName = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.color.text.primary};
  word-break: break-word;
`

export const PawContainer = styled.div`
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
`

export const EmptyMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 16px;
  color: ${({ theme }) => theme.color.text.secondary};
  font-size: 13px;
  text-align: center;
  gap: 12px;
  white-space: pre-line;
`

export const DatePickerOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  z-index: 100;
`

export const DatePickerDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  background: ${({ theme }) => theme.color.container.background};
  border: 1px solid ${({ theme }) => theme.color.container.border};
  border-radius: 8px;
  padding: 8px;
  max-height: 200px;
  overflow-y: auto;
  min-width: 120px;
  z-index: 101;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.color.text.secondary};
    border-radius: 2px;
  }
`

export const DateOption = styled.button<{ $isSelected: boolean }>`
  display: block;
  width: 100%;
  padding: 8px 10px;
  background: ${({ $isSelected, theme }) =>
    $isSelected ? theme.color.button.hover : 'transparent'};
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  color: ${({ theme }) => theme.color.text.primary};
  text-align: left;

  &:hover {
    background: ${({ theme }) => theme.color.button.hover};
  }
`

// 인라인 SVG 발바닥 아이콘 (색상 동적 적용)
export const PawSvg = ({ color, size = 20 }: { color: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 28 29"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6.40924 11.0838C7.10658 9.77225 6.6087 8.14377 5.2972 7.44644C3.9857 6.7491 2.35722 7.24698 1.65989 8.55848C0.962551 9.86997 1.46043 11.4985 2.77193 12.1958C4.08342 12.8931 5.7119 12.3952 6.40924 11.0838Z"
      fill={color}
    />
    <path
      d="M15.5778 5.29766C16.2752 3.98616 15.7773 2.35768 14.4658 1.66035C13.1543 0.963011 11.5258 1.46089 10.8285 2.77239C10.1311 4.08388 10.629 5.71236 11.9405 6.4097C13.252 7.10704 14.8805 6.60916 15.5778 5.29766Z"
      fill={color}
    />
    <path
      d="M26.3392 7.97353C27.0365 6.66204 26.5386 5.03356 25.2271 4.33622C23.9156 3.63888 22.2872 4.13676 21.5898 5.44826C20.8925 6.75976 21.3904 8.38824 22.7019 9.08557C24.0134 9.78291 25.6418 9.28503 26.3392 7.97353Z"
      fill={color}
    />
    <path
      d="M9.89598 15.9837C10.3105 15.2041 10.8745 14.5137 11.5559 13.9521C12.2372 13.3905 13.0225 12.9685 13.8668 12.7104C14.7112 12.4522 15.5982 12.3629 16.4771 12.4475C17.356 12.5321 18.2096 12.7891 18.9893 13.2036L23.145 15.4132C24.1379 15.9416 24.9089 16.8081 25.3181 17.8559C25.7273 18.9036 25.7477 20.0633 25.3757 21.1248C25.0037 22.1864 24.2638 23.0795 23.29 23.6426C22.3163 24.2057 21.1731 24.4014 20.0675 24.1943C18.1636 23.8318 16.5248 24.3312 15.1512 25.6924C14.3508 26.4819 13.2943 26.9589 12.1727 27.037C11.0512 27.115 9.93875 26.7891 9.03671 26.118C8.13468 25.447 7.50263 24.4753 7.25494 23.3786C7.00726 22.282 7.16029 21.1329 7.68636 20.1394L9.89598 15.9837Z"
      fill={color}
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M13.8344 2.84769C13.1787 2.49903 12.3645 2.74796 12.0158 3.40371C11.6671 4.05946 11.9161 4.8737 12.5718 5.22237C13.2276 5.57104 14.0418 5.3221 14.3905 4.66635C14.7391 4.0106 14.4902 3.19636 13.8344 2.84769ZM9.64111 2.14108C10.6871 0.173829 13.1298 -0.572986 15.0971 0.473017C17.0643 1.51902 17.8111 3.96174 16.7651 5.92899C15.7191 7.89624 13.2764 8.64305 11.3092 7.59705C9.34192 6.55104 8.59511 4.10832 9.64111 2.14108ZM24.5958 5.52357C23.9401 5.1749 23.1258 5.42384 22.7771 6.07959C22.4285 6.73534 22.6774 7.54958 23.3332 7.89824C23.9889 8.24691 24.8032 7.99797 25.1518 7.34222C25.5005 6.68648 25.2515 5.87224 24.5958 5.52357ZM20.4025 4.81695C21.4485 2.8497 23.8912 2.10289 25.8584 3.14889C27.8257 4.19489 28.5725 6.63762 27.5265 8.60486C26.4805 10.5721 24.0378 11.3189 22.0705 10.2729C20.1033 9.22692 19.3565 6.7842 20.4025 4.81695ZM4.66586 8.63378C4.01011 8.28512 3.19587 8.53405 2.84721 9.1898C2.49854 9.84555 2.74748 10.6598 3.40323 11.0085C4.05897 11.3571 4.87321 11.1082 5.22188 10.4524C5.57055 9.79669 5.32161 8.98245 4.66586 8.63378ZM0.472529 7.92717C1.51853 5.95992 3.96125 5.2131 5.9285 6.25911C7.89575 7.30511 8.64256 9.74783 7.59656 11.7151C6.55056 13.6823 4.10783 14.4291 2.14059 13.3831C0.173341 12.3371 -0.573475 9.89441 0.472529 7.92717ZM16.3482 13.7861C15.6451 13.7184 14.9355 13.7898 14.26 13.9963C13.5845 14.2029 12.9563 14.5404 12.4112 14.9897C11.8661 15.4391 11.4149 15.9913 11.0833 16.615L8.87478 20.7686C8.87465 20.7689 8.87492 20.7684 8.87478 20.7686C8.49935 21.4781 8.38977 22.2994 8.56663 23.0824C8.74355 23.8657 9.19501 24.5598 9.83932 25.0391C10.4836 25.5184 11.2782 25.7512 12.0793 25.6955C12.8804 25.6397 13.6351 25.299 14.2068 24.7351L15.1512 25.6924L14.2046 24.7373C15.8932 23.0639 17.9795 22.4286 20.3166 22.8729C21.1058 23.0203 21.9218 22.8804 22.6169 22.4785C23.3124 22.0763 23.8409 21.4383 24.1066 20.6801C24.3724 19.9218 24.3578 19.0935 24.0655 18.3451C23.7732 17.5967 23.2225 16.9778 22.5132 16.6003L18.3579 14.3909C17.7342 14.0593 17.0513 13.8538 16.3482 13.7861ZM13.4737 11.4244C14.4869 11.1146 15.5513 11.0074 16.606 11.109C17.6607 11.2105 18.685 11.5188 19.6206 12.0163L23.7762 14.2259C25.0529 14.9052 26.0445 16.0196 26.5707 17.3667C27.0968 18.7138 27.1231 20.2048 26.6448 21.5696C26.1664 22.9344 25.2151 24.0828 23.9632 24.8068C22.7112 25.5307 21.2414 25.7823 19.8199 25.5161L19.8159 25.5154C18.3461 25.2355 17.1558 25.5991 16.0977 26.6476L16.0955 26.6498C15.0665 27.6649 13.7081 28.2781 12.2661 28.3785C10.8241 28.4788 9.39383 28.0597 8.23407 27.197C7.07431 26.3343 6.26168 25.0849 5.94322 23.6749C5.62477 22.265 5.82153 20.7876 6.4979 19.5101L8.70862 15.3524C9.20606 14.4168 9.88289 13.5884 10.7005 12.9145C11.5181 12.2405 12.4604 11.7342 13.4737 11.4244Z"
      fill={color}
    />
  </svg>
)
