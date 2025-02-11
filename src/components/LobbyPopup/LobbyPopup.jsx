import styles from './LobbyPopup.module.css';

const LobbyPopup = ({ onStart }) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
        <img className={styles.logoImage} src='/logo.svg' alt="logo" />
        <div className={styles.logo}> 
          <span className={styles.logoAccent}>CRYPTO </span>
          <span className={styles.logoText}>GAME</span>
        </div>
        <p className={styles.description}>
            마지막 캔들이 양봉인지 음봉인지 맞춰보세요!
        </p>
        <button onClick={onStart} className={styles.startButton}>
          게임 시작
          <span className={styles.buttonIcon}>→</span>
        </button>
      </div>
    </div>
  );
};

export default LobbyPopup; 