import React from 'react'
import styles from './Header.module.css'

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <span className={styles.brandIcon}>← </span>
        <span className={styles.brandText}>Intervue Poll</span>
      </div>
    </header>
  )
}

export default Header