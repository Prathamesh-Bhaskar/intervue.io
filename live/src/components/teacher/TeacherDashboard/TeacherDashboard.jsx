import React, { useEffect } from 'react'
import { useApp } from '../../../context/AppContext'
import { useSocket } from '../../../context/SocketContext'
import Header from '../../common/Header/Header'
import CreatePoll from '../CreatePoll/CreatePoll'
import LiveResults from '../LiveResults/LiveResults'
import PollHistory from '../PollHistory/PollHistory'
import Chat from '../../common/Chat/Chat'
import styles from './TeacherDashboard.module.css'

const TeacherDashboard = () => {
  const { state, dispatch } = useApp()
  const { socket } = useSocket()
  const { currentPoll, teacherDashboardView } = state

  useEffect(() => {
    // Join as teacher when component mounts
    if (socket) {
      socket.emit('teacher:join')
    }
  }, [socket])

  useEffect(() => {
    // Switch to results view when a poll is active, or back to create when poll ends
    if (currentPoll) {
      dispatch({ type: 'SET_TEACHER_DASHBOARD_VIEW', payload: 'results' })
    } else if (teacherDashboardView === 'results') {
      // If we're on results view but no active poll, switch to create
      dispatch({ type: 'SET_TEACHER_DASHBOARD_VIEW', payload: 'create' })
    }
  }, [currentPoll, dispatch, teacherDashboardView])

  const handleViewChange = (view) => {
    dispatch({ type: 'SET_TEACHER_DASHBOARD_VIEW', payload: view })
  }

  const renderContent = () => {
    switch (teacherDashboardView) {
      case 'create':
        return <CreatePoll />
      case 'results':
        return <LiveResults />
      case 'history':
        return <PollHistory />
      default:
        return <CreatePoll />
    }
  }

  return (
    <div className={styles.container}>
      <Header />
      
      <div className={styles.content}>
        <div className={styles.sidebar}>
          <nav className={styles.nav}>
            <button
              className={`${styles.navItem} ${teacherDashboardView === 'create' ? styles.active : ''}`}
              onClick={() => handleViewChange('create')}
            >
              Create Poll
            </button>
            <button
              className={`${styles.navItem} ${teacherDashboardView === 'results' ? styles.active : ''}`}
              onClick={() => handleViewChange('results')}
              disabled={!currentPoll}
            >
              Live Results
            </button>
            <button
              className={`${styles.navItem} ${teacherDashboardView === 'history' ? styles.active : ''}`}
              onClick={() => handleViewChange('history')}
            >
              Poll History
            </button>
          </nav>
        </div>

        <div className={styles.main}>
          {renderContent()}
        </div>
      </div>

      <Chat />
    </div>
  )
}

export default TeacherDashboard