// 日本時間でのISOString形式の日付を取得（YYYY-MM-DD形式）
export const getJSTDateString = () => {
    const now = new Date();
    const jstDate = new Date(now.getTime() + (9 * 60 * 60 * 1000)); // UTC+9の補正
    return jstDate.toISOString().split('T')[0];
};

// 日本時間でのタイムスタンプを取得
export const getJSTTimestamp = () => {
    const now = new Date();
    const jstDate = new Date(now.getTime() + (9 * 60 * 60 * 1000)); // UTC+9の補正
    return jstDate.toISOString();
};