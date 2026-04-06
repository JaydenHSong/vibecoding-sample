import { useState } from 'react';
import { useParams } from 'react-router-dom';
import '../customer/SupportPage.css';

const content = {
  terms: {
    title: 'Terms of Service',
    body: `Welcome to The Curated Gallery. By accessing our website, you agree to these terms.\n\n1. Use of Service\nYou must be at least 18 years old to use this service. You agree to provide accurate information when creating an account.\n\n2. Orders and Payments\nAll orders are subject to availability. Prices are listed in USD and may change without notice.\n\n3. Shipping\nWe offer standard and express shipping options. Delivery times are estimates and not guaranteed.\n\n4. Returns\nItems may be returned within 30 days of purchase in their original condition with tags attached.\n\n5. Limitation of Liability\nThe Curated Gallery is not liable for any indirect, incidental, or consequential damages arising from use of our service.`,
  },
  privacy: {
    title: 'Privacy Policy',
    body: `The Curated Gallery respects your privacy and is committed to protecting your personal data.\n\n1. Information We Collect\nWe collect information you provide directly: name, email, phone, shipping address, and payment information.\n\n2. How We Use Your Information\nWe use your information to process orders, communicate with you, and improve our services.\n\n3. Data Sharing\nWe do not sell your personal information. We share data only with service providers necessary to fulfill orders.\n\n4. Data Security\nWe implement industry-standard security measures to protect your data.\n\n5. Your Rights\nYou may request access to, correction of, or deletion of your personal data at any time.`,
  },
};

export default function TermsPage() {
  const { type } = useParams();
  const [activeTab, setActiveTab] = useState(type === 'privacy' ? 'privacy' : 'terms');
  const current = content[activeTab];

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      <header style={{ marginBottom: 48 }}>
        <span className="label-sm" style={{ display: 'block', marginBottom: 16 }}>Legal</span>
        <h1 style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.04em', textTransform: 'uppercase', lineHeight: 1 }}>{current.title}</h1>
      </header>

      <div className="support-tabs" style={{ marginBottom: 48 }}>
        <button className={`support-tab ${activeTab === 'terms' ? 'active' : ''}`} onClick={() => setActiveTab('terms')}>Terms of Service</button>
        <button className={`support-tab ${activeTab === 'privacy' ? 'active' : ''}`} onClick={() => setActiveTab('privacy')}>Privacy Policy</button>
      </div>

      <div style={{ maxWidth: 720, lineHeight: 2, color: 'var(--color-on-surface-variant)', whiteSpace: 'pre-line', fontSize: 14 }}>
        {current.body}
      </div>
    </div>
  );
}
