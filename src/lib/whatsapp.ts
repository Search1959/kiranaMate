import { Customer, Order, Sale, StoreSettings, LanguageCode } from '../types';

export function sanitizeMobile(mobile: string): string {
  const cleaned = mobile.replace(/\D/g, '');
  if (cleaned.length === 10) return `91${cleaned}`;
  if (cleaned.length === 12 && cleaned.startsWith('91')) return cleaned;
  return cleaned;
}

export function generateUdhaarReminderText(
  customer: Customer,
  settings: StoreSettings,
  lang: LanguageCode = 'en'
): string {
  const balance = customer?.currentBalance ?? customer?.outstandingBalance ?? 0;
  const amountStr = `₹${balance.toLocaleString('en-IN')}`;
  const storeName = settings?.storeName || 'Our Store';
  const phone = settings?.phone || '';
  const upiId = settings?.upiId || phone;
  const custName = customer?.name || 'Valued Customer';

  if (lang === 'hi') {
    return `नमस्ते ${custName} जी,\n\n${storeName} से विनम्र निवेदन है कि आपका बकाया उधार राशि ${amountStr} शेष है।\n\nकृपया सुविधानुसार भुगतान (UPI ID: ${upiId}) पर कर दें।\n\nधन्यवाद!\n${storeName}\nसंपर्क: ${phone}`;
  }

  return `Hello ${custName},\n\nThis is a friendly reminder from ${storeName}. Your pending outstanding balance is ${amountStr}.\n\nPlease kindly clear the payment at your convenience via Cash or UPI (${upiId}).\n\nThank you for your business!\n${storeName}\nContact: ${phone}`;
}

export function generateOrderConfirmationText(
  order: Order,
  settings: StoreSettings,
  lang: LanguageCode = 'en'
): string {
  const itemsText = (order?.items || []).map(i => `• ${i.productName} x ${i.quantity} = ₹${i.total ?? 0}`).join('\n');
  const totalVal = order?.total ?? 0;
  const totalStr = `₹${totalVal.toLocaleString('en-IN')}`;
  const storeName = settings?.storeName || 'Our Store';

  if (lang === 'hi') {
    return `नमस्ते ${order?.customerName || 'ग्राहक'} जी,\n\nआपका ऑर्डर #${order?.orderNumber || ''} ${storeName} में प्राप्त हो गया है।\n\nसामान की सूची:\n${itemsText}\n\nकुल राशि: ${totalStr}\nस्थिति: ${order?.orderStatus || ''}\n\nधन्यवाद!\n${storeName}`;
  }

  return `Hello ${order?.customerName || 'Customer'},\n\nYour Order #${order?.orderNumber || ''} has been received at ${storeName}.\n\nItems:\n${itemsText}\n\nTotal Amount: ${totalStr}\nStatus: ${order?.orderStatus || ''}\n\nThank you!\n${storeName}`;
}

export function generateOrderStatusWhatsAppText(
  order: Order,
  settings: StoreSettings,
  lang: LanguageCode = 'en'
): string {
  const statusLabels: Record<string, string> = {
    NEW: 'Received and Pending Confirmation',
    CONFIRMED: 'Confirmed and Being Packed',
    PREPARING: 'Being Packed',
    READY: 'Ready for Pickup / Delivery',
    OUT_FOR_DELIVERY: 'Out for Delivery 🛵',
    DELIVERED: 'Successfully Delivered ✅',
    CANCELLED: 'Cancelled ❌'
  };

  const statusStr = statusLabels[order?.orderStatus] || order?.orderStatus || 'Pending';
  const storeName = settings?.storeName || 'Our Store';
  const phone = settings?.phone || '';

  if (lang === 'hi') {
    return `नमस्ते ${order?.customerName || 'ग्राहक'} जी,\n\n${storeName} से आपके ऑर्डर #${order?.orderNumber || ''} की अपडेट:\n\nऑर्डर स्थिति: ${statusStr}\nकुल राशि: ₹${order?.total ?? 0}\n\nसंपर्क: ${phone}\nधन्यवाद!`;
  }

  return `Hello ${order?.customerName || 'Customer'},\n\nUpdate on your Order #${order?.orderNumber || ''} from ${storeName}:\n\nStatus: ${statusStr}\nTotal Amount: ₹${order?.total ?? 0}\n\nContact: ${phone}\nThank you!`;
}

export function generateInvoiceWhatsAppText(
  sale: Sale,
  settings: StoreSettings,
  lang: LanguageCode = 'en'
): string {
  const itemsText = (sale?.items || []).map(i => `• ${i.productName} (${i.quantity}) = ₹${i.totalPrice ?? 0}`).join('\n');
  const grandTotal = sale?.grandTotal ?? 0;
  const totalStr = `₹${grandTotal.toLocaleString('en-IN')}`;
  const storeName = settings?.storeName || 'Our Store';

  if (lang === 'hi') {
    return `नमस्ते ${sale?.customerName || 'ग्राहक'} जी,\n\n${storeName} से खरीदारी का बिल #${sale?.saleNumber || ''}:\n\n${itemsText}\n\nकुल राशि: ${totalStr}\nभुगतान प्रकार: ${sale?.paymentMethod || ''}\n\nधन्यवाद! फिर पधारें।`;
  }

  return `Hello ${sale?.customerName || 'Valued Customer'},\n\nBill Invoice #${sale?.saleNumber || ''} from ${settings?.storeName || 'Our Store'}:\n\n${itemsText}\n\nGrand Total: ${totalStr}\nPayment Method: ${sale?.paymentMethod || ''}\n\nThank you for shopping with us!`;
}

export function getWhatsAppWebLink(mobile: string, text: string): string {
  const formattedMobile = sanitizeMobile(mobile);
  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${formattedMobile}?text=${encodedText}`;
}

export function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
  } else {
    // Fallback
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return Promise.resolve(successful);
    } catch {
      document.body.removeChild(textArea);
      return Promise.resolve(false);
    }
  }
}
