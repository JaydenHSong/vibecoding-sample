import './OrderStatusBadge.css';

const statusMap = {
  pending: { label: 'Pending', className: 'pending' },
  paid: { label: 'Paid', className: 'paid' },
  shipping: { label: 'Shipping', className: 'shipping' },
  delivered: { label: 'Delivered', className: 'delivered' },
  cancelled: { label: 'Cancelled', className: 'cancelled' },
};

export default function OrderStatusBadge({ status }) {
  const info = statusMap[status] || { label: status, className: '' };
  return <span className={`order-badge order-badge--${info.className}`}>{info.label}</span>;
}
