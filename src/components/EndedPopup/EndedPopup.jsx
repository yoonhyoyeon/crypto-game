import styles from './EndedPopup.module.css';

const EndedPopup = ({ isSuccess, onGoToLobby }) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
        <div className={styles.result}>
          {isSuccess ? (
            <>
              <span className={styles.resultText}>예측 성공!</span>
              <span className={styles.emoji}>🎯</span>
            </>
          ) : (
            <>
              <span className={styles.resultText}>예측 실패</span>
              <span className={styles.emoji}>😢</span>
            </>
          )}
        </div>
        <p className={styles.description}>
          {isSuccess 
            ? '정확한 예측이었습니다!'
            : '다음 기회에 도전해보세요!'}
        </p>
        <button className={styles.restartButton} onClick={onGoToLobby}>
          로비로 이동하기
          <span className={styles.buttonIcon}>→</span>
        </button>
      </div>
    </div>
  );
};

export default EndedPopup; 