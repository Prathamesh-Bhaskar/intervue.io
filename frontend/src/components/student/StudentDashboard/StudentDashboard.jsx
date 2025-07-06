import React, { useEffect } from 'react'
import { useApp } from '../../../context/AppContext'
import { useSocket } from '../../../context/SocketContext'
import Header from '../../common/Header/Header'
import WaitingScreen from '../WaitingScreen/WaitingScreen'
import PollAnswer from '../PollAnswer/PollAnswer'
import PollResults from '../../common/PollResults/PollResults'
import Chat from '../../common/Chat/Chat'
import styles from './StudentDashboard.module.css'

const StudentDashboard = () => {
  const { state } = useApp()
  const { socket } = useSocket()
  const { currentPoll, hasVoted, timeRemaining, studentName } = state

  useEffect(() => {
    // Join the student session when component mounts
    if (socket && studentName) {
      socket.emit('student:join', { name: studentName })
    }
  }, [socket, studentName])

  const renderContent = () => {
    if (!currentPoll) {
      return <WaitingScreen />
    }

    if (currentPoll && !hasVoted && timeRemaining > 0) {
      return <PollAnswer poll={currentPoll} />
    }

    return <PollResults />
  }

  return (
    <div className={styles.container}>
      <Header />
      
      <div className={styles.content}>
        {renderContent()}
      </div>

      <Chat />
    </div>
  )
}

export default StudentDashboard
