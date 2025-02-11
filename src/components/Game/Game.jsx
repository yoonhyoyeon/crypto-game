import { useEffect, useRef, useState } from 'react';
import styles from './Game.module.css';
import OrderBook from '../OrderBook/OrderBook';
import { GAME_STATE } from '../../constants';

export default function Game({ gameState, onGameEnd }) {
    const canvasRef = useRef(null);
    const [candles, setCandles] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isWaiting, setIsWaiting] = useState(false);
    const [lastCandle, setLastCandle] = useState(null);
    const [selectedGuess, setSelectedGuess] = useState(null);

    // gameState가 변경될 때마다 게임 데이터 초기화
    useEffect(() => {
        if (gameState === GAME_STATE.PLAYING) {
            // 게임 데이터 초기화
            setCandles([]);
            setCurrentIndex(0);
            setIsWaiting(false);
            setLastCandle(null);
            setSelectedGuess(null);
            // 새로운 캔들 데이터 생성
            generateCandles();
        }
    }, [gameState]);

    // 랜덤 캔들 데이터 생성
    const generateCandles = () => {
        const newCandles = [];
        let prevClose = 10000; // 시작 가격
        const baseDate = new Date('2024-01-01');

        // 51개 생성 (50개 표시 + 1개 정답)
        for (let i = 0; i < 51; i++) {
            const volatility = Math.random() * 200 - 100; // -100 ~ 100
            const open = prevClose;
            const close = open + volatility;
            const high = Math.max(open, close) + Math.random() * 50;
            const low = Math.min(open, close) - Math.random() * 50;
            const volume = Math.floor(Math.random() * 1000000) + 100000;
            const date = new Date(baseDate);
            date.setDate(baseDate.getDate() + i);

            newCandles.push({
                open,
                high,
                low,
                close,
                volume,
                date,
            });

            prevClose = close;
        }

        setCandles(newCandles.slice(0, 50));  // 50개 표시
        setLastCandle(newCandles[50]);        // 51번째는 정답용
    };

    // 캔들차트 그리기
    const drawChart = (ctx, width, height) => {
        if (!candles.length) return;

        ctx.clearRect(0, 0, width, height);
        
        const chartHeight = height * 0.6;
        const volumeHeight = height * 0.2;
        const chartGap = height * 0.2;
        const candleWidth = 12;  // 캔들 너비 축소
        const spacing = 6;       // 간격 축소
        const leftPadding = 50;
        const rightPadding = 100;
        const chartWidth = width - leftPadding - rightPadding;
        
        // 가격 범위 계산
        const prices = candles.flatMap(candle => [candle.high, candle.low]);
        const maxPrice = Math.max(...prices);
        const minPrice = Math.min(...prices);
        const priceRange = maxPrice - minPrice;
        
        // 거래량 범위 계산
        const volumes = candles.map(candle => candle.volume);
        const maxVolume = Math.max(...volumes);

        // 각 캔들 그리기
        candles.slice(0, currentIndex + 1).forEach((candle, i) => {
            const x = i * (candleWidth + spacing) + leftPadding;
            
            // 캔들 그리기 (캔들 색상은 그대로 시가/종가 비교)
            const isGreen = candle.close > candle.open;
            ctx.strokeStyle = isGreen ? '#00ff88' : '#ff4444';
            ctx.fillStyle = isGreen ? '#00ff88' : '#ff4444';
            
            // 심지 그리기
            ctx.beginPath();
            ctx.moveTo(x + candleWidth / 2, 
                (maxPrice - candle.high) * chartHeight / priceRange + 50);
            ctx.lineTo(x + candleWidth / 2, 
                (maxPrice - candle.low) * chartHeight / priceRange + 50);
            ctx.stroke();
            
            // 몸통 그리기
            const candleHeight = Math.abs(candle.close - candle.open) * chartHeight / priceRange;
            ctx.fillRect(
                x,
                (maxPrice - Math.max(candle.open, candle.close)) * chartHeight / priceRange + 50,
                candleWidth,
                Math.max(candleHeight, 1)
            );

            // 거래량 그리기 (거래량 증감에 따른 색상 변경)
            const volumeBarHeight = (candle.volume / maxVolume) * volumeHeight;
            const prevCandle = i > 0 ? candles[i - 1] : null;
            const isVolumeUp = prevCandle ? candle.volume > prevCandle.volume : true;
            
            // 거래량 바의 색상을 거래량 증감에 따라 설정
            ctx.fillStyle = isVolumeUp ? '#00ff88' : '#ff4444';
            ctx.globalAlpha = 0.5;
            ctx.fillRect(
                x,
                height - volumeBarHeight,
                candleWidth,
                volumeBarHeight
            );
            ctx.globalAlpha = 1.0;

            // 날짜 표시 (5개 간격으로)
            if (i % 5 === 0) {
                ctx.fillStyle = '#888';
                ctx.textAlign = 'center';
                ctx.font = '12px Arial';
                const dateStr = candle.date.toLocaleDateString('ko-KR', {
                    month: 'numeric',
                    day: 'numeric'
                });
                ctx.fillText(dateStr, x + candleWidth / 2, chartHeight + 100);
            }
        });

        // 현재 캔들의 종가 화살표 표시
        if (currentIndex >= 0 && currentIndex < candles.length) {
            const currentCandle = candles[currentIndex];
            const prevCandle = currentIndex > 0 ? candles[currentIndex - 1] : null;
            const isUp = currentCandle.close > currentCandle.open;
            
            const y = (maxPrice - currentCandle.close) * chartHeight / priceRange + 50;
            
            // 가격 정보 박스 그리기
            const boxWidth = 90;  // 박스 너비
            const boxHeight = 36; // 박스 높이
            const boxX = width - rightPadding - 5;  // 박스 시작 x 좌표
            const boxY = y - boxHeight / 2;  // 박스 시작 y 좌표

            // 점선 그리기
            ctx.strokeStyle = '#666';
            ctx.setLineDash([2, 2]);
            ctx.beginPath();
            ctx.moveTo(width - rightPadding - 40, y);
            ctx.lineTo(boxX, y);
            ctx.stroke();
            ctx.setLineDash([]);

            // 배경 박스 그리기
            ctx.fillStyle = '#1a1a1a';
            ctx.strokeStyle = isUp ? '#00ff88' : '#ff4444';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.rect(boxX, boxY, boxWidth, boxHeight);
            ctx.fill();
            ctx.stroke();
            ctx.lineWidth = 1;

            // 가격 정보 텍스트
            const priceChange = currentCandle.close - currentCandle.open;
            const changePercent = (priceChange / currentCandle.open) * 100;
            
            // 현재가
            ctx.fillStyle = isUp ? '#00ff88' : '#ff4444';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(
                Math.round(currentCandle.close).toLocaleString(),
                boxX + boxWidth / 2,
                boxY + 15
            );
            
            // 등락률 (시가 대비)
            ctx.font = '11px Arial';
            ctx.fillText(
                `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`,
                boxX + boxWidth / 2,
                boxY + 28
            );
        }

        // 가격 눈금 그리기 (오른쪽에)
        ctx.fillStyle = '#666';
        ctx.textAlign = 'left';
        ctx.font = '12px Arial';
        for (let i = 0; i <= 4; i++) {
            const price = minPrice + (priceRange * i / 4);
            const y = (maxPrice - price) * chartHeight / priceRange + 50;
            ctx.fillText(Math.round(price).toLocaleString(), width - rightPadding + 20, y);
        }

        // 거래량 눈금 그리기 (오른쪽에)
        ctx.fillStyle = '#666';
        ctx.textAlign = 'left';
        const volumeY = height - volumeHeight;
        ctx.fillText(Math.round(maxVolume).toLocaleString(), width - rightPadding + 20, volumeY);
    };

    // 캔들 애니메이션
    useEffect(() => {
        if (!candles.length) {
            generateCandles();
            return;
        }

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        drawChart(ctx, canvas.width, canvas.height);

        if (currentIndex < 49) {
            const timer = setTimeout(() => {
                setCurrentIndex(prev => prev + 1);
            }, 100);  // 200ms에서 100ms로 변경하여 애니메이션 속도 2배 증가
            return () => clearTimeout(timer);
        } else if (!isWaiting) {
            setIsWaiting(true);
        }
    }, [candles, currentIndex]);

    // 키보드 입력 처리
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (!isWaiting || selectedGuess) return;  // 이미 선택했으면 무시

            if (e.key.toLowerCase() === 'a' || e.key.toLowerCase() === 's') {
                const guess = e.key.toLowerCase() === 'a';
                setSelectedGuess(guess ? 'bull' : 'bear');  // 선택 상태 저장
                
                setCandles(prev => [...prev, lastCandle]);
                setCurrentIndex(50);
                
                setTimeout(() => {
                    const actual = lastCandle.close > lastCandle.open;
                    onGameEnd(guess === actual);
                }, 3000);  // 1초에서 3초로 변경
            }
        };

        window.addEventListener('keypress', handleKeyPress);
        return () => window.removeEventListener('keypress', handleKeyPress);
    }, [isWaiting, lastCandle, selectedGuess]);

    return (
        <div className={styles.container} style={{ 
            visibility: gameState === GAME_STATE.PLAYING ? 'visible' : 'hidden' 
        }}>
            <div className={styles.gameContent}>
                <canvas
                    ref={canvasRef}
                    width={1200}
                    height={600}
                    className={styles.canvas}
                />
                <OrderBook 
                    currentPrice={candles[currentIndex]?.close || 10000}
                />
            </div>
            {isWaiting && (
                <div className={styles.controls}>
                    <p>다음 캔들이 양봉일까요 음봉일까요?</p>
                    <div className={styles.buttons}>
                        <button 
                            className={`${styles.bullButton} ${selectedGuess === 'bull' ? styles.active : ''}`}
                            disabled={selectedGuess !== null}
                        >
                            양봉 (A)
                        </button>
                        <button 
                            className={`${styles.bearButton} ${selectedGuess === 'bear' ? styles.active : ''}`}
                            disabled={selectedGuess !== null}
                        >
                            음봉 (S)
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}