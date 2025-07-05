import React from 'react'
import Header from '../../common/Header/Header'
import LoadingSpinner from '../../common/LoadingSpinner/LoadingSpinner'
import styles from './WaitingScreen.module.css'

const WaitingScreen = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.badge}>
          <span className={styles.badgeIcon}>←</span>
          <span className={styles.badgeText}>Intervue Poll</span>
        </div>
        
        <LoadingSpinner />
        
        <h2 className={styles.title}>
          Wait for the teacher to ask questions..
        </h2>
      </div>
    </div>
  )
}

export default WaitingScreen