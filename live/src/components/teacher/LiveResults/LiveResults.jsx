import React, { useState } from 'react'
import { useApp } from '../../../context/AppContext'
import { useSocket } from '../../../context/SocketContext'
import { useNavigate } from 'react-router-dom'
import PollResults from '../../common/PollResults/PollResults'
import styles from './LiveResults.module.css'

const LiveResults = () => {
  const { state, dispatch } = useApp()
  const { socket } = useSocket()
  const { currentPoll, pollResults } = state
  const navigate = useNavigate()
  const [showWarning, setShowWarning] = useState(false)

  const handleNewQuestion = () => {
    // Defensive: support both pollResults shape
    const voterCount = pollResults.voterCount ?? 0
    const connectedStudents = pollResults.connectedStudents ?? 0

    if (connectedStudents > 0 && voterCount < connectedStudents) {
      setShowWarning(true)
      return
    }
    // All students have answered, end poll and redirect
    socket?.emit('teacher:end_poll', (response) => {
      if (response?.success) {
        dispatch({ type: 'RESET_POLL' })
        navigate('/teacher/create-poll')
      }
    })
  }

  if (!currentPoll) {
    return (
      <div className={styles.noPoll}>
        <p>No active poll. Create a new poll to see results.</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <PollResults />
      
      <div className={styles.actions}>
        <button 
          className={styles.newQuestionBtn}
          onClick={handleNewQuestion}
        >
          + Ask a new question
        </button>
      </div>
      {showWarning && (
        <div style={{ color: 'red', marginTop: 12, fontWeight: 500 }}>
          Not all students have answered yet!
        </div>
      )}
    </div>
  )
}

export default LiveResults