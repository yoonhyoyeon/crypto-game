import { useState } from 'react';
import { GAME_STATE } from './constants';
import LobbyPopup from './components/LobbyPopup';
import EndedPopup from './components/EndedPopup';
import Game from './components/Game';

function App() {
  const [gameState, setGameState] = useState(GAME_STATE.LOBBY);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const handleGameStart = () => {
    setGameState(GAME_STATE.PLAYING);
  };

  const handleGameEnd = (success) => {
    setIsSuccess(success);
    setGameState(GAME_STATE.ENDED);
  };

  const handleGoToLobby = () => {
    setGameState(GAME_STATE.LOBBY);
  };

  return (
    <div>
      {gameState === GAME_STATE.LOBBY ? (
        <LobbyPopup onStart={handleGameStart} />
      ) : null}
      {gameState === GAME_STATE.ENDED ? (
        <EndedPopup isSuccess={isSuccess} onGoToLobby={handleGoToLobby} />
      ) : null}
      <Game 
        isSuccess={isSuccess}
        gameState={gameState} 
        onGameEnd={handleGameEnd} 
      />
    </div>
  );
}

export default App;
