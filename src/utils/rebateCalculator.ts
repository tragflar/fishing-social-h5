// 返点计算工具函数

export const calculateTransfer = (
    amount: number,
    fromRebate: number,
    toRebate: number,
): { actualAmount: number; rebateDiff: number } => {
    const rebateDiff = toRebate - fromRebate;
    const actualAmount = amount * (1 + rebateDiff / 100);
    
    return {
        actualAmount: parseFloat(actualAmount.toFixed(2)),
        rebateDiff,
    };
};

// 退款计算（后进先出）
export const calculateRefund = (
    accountId: string,
    amount: number,
    transactions: Array<{
        amount: number;
        rebateRate: number;
        timestamp: Date;
    }>,
) => {
    // 按时间倒序排列交易记录（后进先出）
    const sortedTransactions = [...transactions].sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
    );
    
    let remainingAmount = amount;
    let totalRefund = 0;
    const refundDetails: Array<{
        amount: number;
        rebateRate: number;
        refundAmount: number;
    }> = [];
    
    for (const transaction of sortedTransactions) {
        if (remainingAmount <= 0) break;
        
        const refundAmount = Math.min(remainingAmount, transaction.amount);
        const refundValue = refundAmount * (1 - transaction.rebateRate / 100);
        
        refundDetails.push({
            amount: refundAmount,
            rebateRate: transaction.rebateRate,
            refundAmount: refundValue,
        });
        
        totalRefund += refundValue;
        remainingAmount -= refundAmount;
    }
    
    return {
        totalRefund: parseFloat(totalRefund.toFixed(2)),
        refundDetails,
        remainingAmount,
    };
};

// 先进先出计算
export const calculateFifoConsumption = (
    amount: number,
    transactions: Array<{
        amount: number;
        rebateRate: number;
        timestamp: Date;
    }>,
) => {
    // 按时间正序排列交易记录（先进先出）
    const sortedTransactions = [...transactions].sort(
        (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
    );
    
    let remainingAmount = amount;
    let totalConsumption = 0;
    const consumptionDetails: Array<{
        amount: number;
        rebateRate: number;
        consumptionAmount: number;
    }> = [];
    
    for (const transaction of sortedTransactions) {
        if (remainingAmount <= 0) break;
        
        const consumptionAmount = Math.min(remainingAmount, transaction.amount);
        const consumptionValue = consumptionAmount * (1 + transaction.rebateRate / 100);
        
        consumptionDetails.push({
            amount: consumptionAmount,
            rebateRate: transaction.rebateRate,
            consumptionAmount: consumptionValue,
        });
        
        totalConsumption += consumptionValue;
        remainingAmount -= consumptionAmount;
    }
    
    return {
        totalConsumption: parseFloat(totalConsumption.toFixed(2)),
        consumptionDetails,
        remainingAmount,
    };
}; 