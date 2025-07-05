import React, { useEffect, useState } from 'react'
import { useSocket } from '../../../context/SocketContext'
import styles from './PollHistory.module.css'

const PollHistory = () => {
  const [pollHistory, setPollHistory] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { socket } = useSocket()

  useEffect(() => {
    // Fetch poll history when component mounts
    if (socket) {
      socket.emit('teacher:get_history', (response) => {
        setIsLoading(false)
        if (response?.success) {
          setPollHistory(response.data || [])
        }
      })
    }
  }, [socket])

  const getPercentage = (count, total) => {
    if (total === 0) return 0
    return Math.round((count / total) * 100)
  }

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <p>Loading poll history...</p>
      </div>
    )
  }

  if (pollHistory.length === 0) {
    return (
      <div className={styles.noPollHistory}>
        <p>No poll history available. Create some polls to see them here.</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>View Poll History</h1>
      </div>

      <div className={styles.pollList}>
        {pollHistory.map((poll, pollIndex) => {
          const totalVotes = Object.values(poll.results || {}).reduce((sum, count) => sum + count, 0)

          return (
            <div key={poll.id || pollIndex} className={styles.pollCard}>
              <div className={styles.pollHeader}>
                <h3 className={styles.pollTitle}>Question {pollIndex + 1}</h3>
                <span className={styles.pollDate}>
                  {new Date(poll.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className={styles.question}>
                {poll.question}
              </div>

              <div className={styles.results}>
                {poll.options.map((option, index) => {
                  const count = poll.results?.[option] || 0
                  const percentage = getPercentage(count, totalVotes)
                  const barWidth = totalVotes > 0 ? (count / totalVotes) * 100 : 0

                  return (
                    <div key={index} className={styles.resultItem}>
                      <div className={styles.optionInfo}>
                        <div className={styles.optionCircle}>
                          <span className={styles.optionNumber}>{index + 1}</span>
                        </div>
                        <span className={styles.optionText}>{option}</span>
                      </div>
                      
                      <div className={styles.barContainer}>
                        <div 
                          className={styles.bar}
                          style={{ width: `${barWidth}%` }}
                        ></div>
                      </div>
                      
                      <div className={styles.percentage}>
                        {percentage}%
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className={styles.pollFooter}>
                <span className={styles.totalVotes}>
                  Total responses: {totalVotes}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default PollHistory