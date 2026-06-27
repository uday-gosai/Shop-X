export const CATEGORIES = [
    { label: 'Electronics', value: 'Electronics' },
    { label: 'Fashion', value: 'Fashion' },
    { label: 'Grocery', value: 'Grocery' },
    { label: 'Books', value: 'Books' },
    { label: 'Furniture', value: 'Furniture' },
    { label: 'Home', value: 'Home' },
    { label: 'Toys', value: 'Toys' },
    { label: 'Sports', value: 'Sports' },
    { label: 'Mobiles', value: 'Mobiles' },
    { label: '2 Wheels', value: '2 Wheels' },
];

export const ORDER_STATUS = {
    PLACED: {
        label: 'Order Placed',
        color: '#3B82F6',
        bg: '#EFF6FF',
        border: '#BFDBFE',
        icon: '📦',
    },
    SHIPPED: {
        label: 'Shipped',
        color: '#F59E0B',
        bg: '#FFFBEB',
        border: '#FDE68A',
        icon: '🚚',
    },
    DELIVERED: {
        label: 'Delivered',
        color: '#10B981',
        bg: '#ECFDF5',
        border: '#A7F3D0',
        icon: '✨',
    },
    CANCELLED: {
        label: 'Cancelled',
        color: '#EF4444',
        bg: '#FEF2F2',
        border: '#FECACA',
        icon: '❌',
    },
};

export const PAYMENT_MODES = [
    { label: 'Cash on Delivery (COD)', value: 'COD' },
    { label: 'Online Payment (UPI/Card)', value: 'Online Payment' },
];
