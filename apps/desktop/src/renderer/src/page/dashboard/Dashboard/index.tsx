import { ReactNode } from 'react'
import { DashboardContainer } from '../styles'
import DashboardHeader from './Header'
import DashboardTaskList from './TaskList'
import DashboardEmpty from './Empty'
import DatePicker from '../DatePicker'

interface DashboardProps {
  children: ReactNode
}

const Dashboard = ({ children }: DashboardProps) => {
  return <DashboardContainer>{children}</DashboardContainer>
}

Dashboard.Header = DashboardHeader
Dashboard.TaskList = DashboardTaskList
Dashboard.Empty = DashboardEmpty
Dashboard.DatePicker = DatePicker

export default Dashboard
