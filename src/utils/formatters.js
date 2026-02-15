export const formatPeriod = (dateObj = new Date()) => {
    const d = new Date(dateObj); // Ensure we have a Date object
    const month = d.toLocaleString('en-JM', { month: 'long' });
    const year = d.getFullYear();
    return `${month}-${year}`;
};

export const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMins < 1) return 'JUST NOW';
    if (diffInMins < 60) return `${diffInMins} MINS AGO`;
    if (diffInHours < 24) return `${diffInHours} HOURS AGO`;
    return `${diffInDays} DAYS AGO`;
};

export const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-JM', { style: 'currency', currency: 'JMD' }).format(val);
};
