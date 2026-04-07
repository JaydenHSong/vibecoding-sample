import { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

export default function StripeCardForm({ onSuccess, onError, submitting, setSubmitting }) {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    setMessage('');

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (error) {
      setMessage(error.message);
      setSubmitting(false);
      onError?.(error.message);
    } else if (paymentIntent?.status === 'succeeded') {
      onSuccess(paymentIntent.id);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement options={{ layout: 'tabs' }} />
      {message && <p style={{ color: '#ba1a1a', marginTop: 12, fontSize: 14 }}>{message}</p>}
      <button
        type="submit"
        className="checkout-page__purchase-btn"
        disabled={!stripe || submitting}
      >
        {submitting ? 'Processing...' : 'Purchase Now'}
      </button>
    </form>
  );
}
