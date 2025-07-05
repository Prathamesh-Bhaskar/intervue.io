import React, { useState, useEffect } from 'react'
import { useApp } from '../../../context/AppContext'
import { useSocket } from '../../../context/SocketContext'
import Header from '../../common/Header/Header'
import CreatePoll from '../CreatePoll/CreatePoll'
import LiveResults from '../LiveResults/LiveResults'
import PollHistory from '../PollHistory/PollHistory'
import Chat from '../../common/Chat/Chat'
import styles from './TeacherDashboard.module.css'

const TeacherDashboard = () => {
  const [currentView, setCurrentView] = useState('create') // 'create', 'results', 'history'
  const { state } = useApp()
  const { socket } = useSocket()
  const { currentPoll } = state

  useEffect(() => {
    // Join as teacher when component mounts
    if (socket) {
      socket.emit('teacher:join')
    }
  }, [socket])

  useEffect(() => {
    // Switch to results view when a poll is active
    if (currentPoll) {
      setCurrentView('results')
    }
  }, [currentPoll])

  const renderContent = () => {
    switch (currentView) {
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
              className={`${styles.navItem} ${currentView === 'create' ? styles.active : ''}`}
              onClick={() => setCurrentView('create')}
            >
              Create Poll
            </button>
            <button
              className={`${styles.navItem} ${currentView === 'results' ? styles.active : ''}`}
              onClick={() => setCurrentView('results')}
              disabled={!currentPoll}
            >
              Live Results
            </button>
            <button
              className={`${styles.navItem} ${currentView === 'history' ? styles.active : ''}`}
              onClick={() => setCurrentView('history')}
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