import styles from './OrderBook.module.css';

const OrderBook = ({ currentPrice }) => {
    const generateOrderBook = () => {
        const orders = [];
        const gap = Math.round(currentPrice * 0.0001); // 호가 단위 더 작게 조정

        // 매도호가 15단계
        for (let i = 0; i < 15; i++) {
            const price = Math.round(currentPrice + gap * (i + 1));
            const amount = (Math.random() * 5).toFixed(6);  // BTC 수량
            const volume = price * parseFloat(amount);  // 거래대금 (USDT)
            orders.unshift({ price, amount, volume, type: 'ask' });
        }

        // 현재가
        orders.push({
            price: currentPrice,
            amount: (Math.random() * 5).toFixed(6),
            volume: currentPrice * parseFloat(orders[0].amount),
            type: 'current'
        });

        // 매수호가 15단계
        for (let i = 0; i < 15; i++) {
            const price = Math.round(currentPrice - gap * (i + 1));
            const amount = (Math.random() * 5).toFixed(6);
            const volume = price * parseFloat(amount);
            orders.push({ price, amount, volume, type: 'bid' });
        }

        // 최대 거래량 계산
        const maxVolume = Math.max(...orders.map(order => order.volume));
        
        // 각 주문에 대한 상대적 비율 계산
        return orders.map(order => ({
            ...order,
            ratio: (order.volume / maxVolume) * 100
        }));
    };

    const orders = generateOrderBook();

    return (
        <div className={styles.orderBook}>
            <div className={styles.header}>
                <span>가격<br/>(USDT)</span>
                <span>수량<br/>(BTC)</span>
                <span>총액<br/>(USDT)</span>
            </div>
            <div className={styles.orders}>
                {orders.map((order, index) => (
                    <div 
                        key={index} 
                        className={`${styles.row} ${order.type === 'current' ? styles.currentPrice : ''}`}
                    >
                        {/* 프로그레스바 배경 */}
                        <div 
                            className={styles.progressBar}
                            style={{
                                width: `${order.ratio}%`,
                                background: order.type === 'ask' ? 'rgba(255, 68, 68, 0.1)' : 
                                          order.type === 'bid' ? 'rgba(0, 255, 136, 0.1)' : 
                                          'rgba(255, 255, 255, 0.05)'
                            }}
                        />
                        
                        {/* 주문 정보 */}
                        <div className={styles.rowContent}>
                            <span className={styles.price} style={{
                                color: order.type === 'ask' ? '#ff4444' : 
                                      order.type === 'bid' ? '#00ff88' : '#ffffff'
                            }}>
                                {order.price.toLocaleString()}
                            </span>
                            <span className={styles.amount}>
                                {parseFloat(order.amount).toFixed(6)}
                            </span>
                            <span className={styles.volume}>
                                {Math.round(order.volume).toLocaleString()}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OrderBook; 