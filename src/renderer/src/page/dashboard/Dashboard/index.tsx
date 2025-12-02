import { DashboardContainer } from '../styles'
import DashboardHeader from './Header'
import DashboardTaskList from './TaskList'
import DashboardEmpty from './Empty'

interface DashboardProps {
  children: React.ReactNode
}

const Dashboard = ({ children }: DashboardProps) => {
  return <DashboardContainer>{children}</DashboardContainer>
}

Dashboard.Header = DashboardHeader
Dashboard.TaskList = DashboardTaskList
Dashboard.Empty = DashboardEmpty

export default Dashboard
