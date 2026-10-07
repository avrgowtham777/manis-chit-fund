import { formatCurrency } from './currency';

/**
 * Format an Indian phone number for wa.me / sms link
 * Accepts: "9876543210", "+91 98765 43210", "919876543210", etc.
 * Returns clean digits with "91" prefix: "919876543210"
 */
export function formatPhoneForWhatsApp(phone) {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 10) {
    return `91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits;
  }
  if (digits.length > 10 && digits.startsWith('0')) {
    return `91${digits.slice(1)}`;
  }
  return digits.length >= 10 ? digits : null;
}

/**
 * Generate formatted WhatsApp Payment Receipt message & link
 */
export function getPaymentWhatsAppShare({
  memberName,
  phone,
  monthLabel,
  calendarMonth,
  amountDue,
  amountPaid,
  remainingAmount,
  status,
  receiptNumber,
  paymentDate
}) {
  const formattedPaid = formatCurrency(amountPaid);
  const formattedDue = formatCurrency(amountDue);
  const formattedRemaining = formatCurrency(remainingAmount);
  const statusText = status === 'paid' ? '🟢 FULLY PAID' : (status === 'partial' ? '🟠 PARTIAL PAYMENT' : '🔴 PENDING');
  const dateStr = paymentDate || new Date().toLocaleDateString('en-IN');

  const text = `🔔 *MANI'S CHIT FUND — PAYMENT RECEIPT*
━━━━━━━━━━━━━━━━━━━━
Dear *${memberName || 'Member'}*,

Your chit fund payment has been successfully recorded!

🗓 *Month:* ${monthLabel || 'Month'} (${calendarMonth || ''})
💰 *Amount Due:* ${formattedDue}
✅ *Amount Paid:* ${formattedPaid}
⏳ *Remaining Balance:* ${formattedRemaining}
📊 *Payment Status:* ${statusText}
🧾 *Receipt No:* ${receiptNumber || 'N/A'}
📅 *Date:* ${dateStr}

Thank you for your timely contribution!
— *MANI'S CHIT FUND*`;

  const cleanPhone = formatPhoneForWhatsApp(phone);
  const whatsappUrl = cleanPhone 
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}` 
    : `https://wa.me/?text=${encodeURIComponent(text)}`;
  const smsUrl = cleanPhone
    ? `sms:${cleanPhone}?body=${encodeURIComponent(text)}`
    : null;

  return { text, cleanPhone, whatsappUrl, smsUrl, hasPhone: Boolean(cleanPhone) };
}

/**
 * Generate formatted WhatsApp Reminder message & link for pending dues
 */
export function getReminderWhatsAppShare({
  memberName,
  phone,
  monthLabel,
  calendarMonth,
  amountDue,
  remainingAmount
}) {
  const formattedDue = formatCurrency(amountDue);
  const formattedRemaining = formatCurrency(remainingAmount);

  const text = `🔔 *MANI'S CHIT FUND — PAYMENT REMINDER*
━━━━━━━━━━━━━━━━━━━━
Dear *${memberName || 'Member'}*,

This is a gentle reminder regarding your chit fund contribution:

🗓 *Month:* ${monthLabel || 'Month'} (${calendarMonth || ''})
💰 *Monthly Due:* ${formattedDue}
⏳ *Outstanding Balance:* ${formattedRemaining}

Kindly arrange the payment at your earliest convenience. If you have already paid, please contact us.

Thank you!
— *MANI'S CHIT FUND*`;

  const cleanPhone = formatPhoneForWhatsApp(phone);
  const whatsappUrl = cleanPhone 
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}` 
    : `https://wa.me/?text=${encodeURIComponent(text)}`;
  const smsUrl = cleanPhone
    ? `sms:${cleanPhone}?body=${encodeURIComponent(text)}`
    : null;

  return { text, cleanPhone, whatsappUrl, smsUrl, hasPhone: Boolean(cleanPhone) };
}

/**
 * Generate formatted WhatsApp Chit Lift Winner message & link
 */
export function getLiftWinnerWhatsAppShare({
  memberName,
  phone,
  monthLabel,
  calendarMonth,
  receivableAmount
}) {
  const formattedAmount = formatCurrency(receivableAmount);

  const text = `🎊 *CONGRATULATIONS FROM MANI'S CHIT FUND!*
━━━━━━━━━━━━━━━━━━━━
Dear *${memberName || 'Member'}*,

We are happy to announce that you have been selected as the Chit Lift winner for:
🏆 *Chit Month:* ${monthLabel || 'Month'} (${calendarMonth || ''})
💰 *Receivable Amount:* ${formattedAmount}

Congratulations! Please contact the organiser for the payout distribution.
— *MANI'S CHIT FUND*`;

  const cleanPhone = formatPhoneForWhatsApp(phone);
  const whatsappUrl = cleanPhone 
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}` 
    : `https://wa.me/?text=${encodeURIComponent(text)}`;
  const smsUrl = cleanPhone
    ? `sms:${cleanPhone}?body=${encodeURIComponent(text)}`
    : null;

  return { text, cleanPhone, whatsappUrl, smsUrl, hasPhone: Boolean(cleanPhone) };
}
