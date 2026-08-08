import { Customer, Order, Sale, StoreSettings, LanguageCode } from '../types';
import { formatMoney } from './currency';

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
  const amountStr = formatMoney(balance, settings?.currencySymbol, settings?.currencyCode);
  const storeName = settings?.storeName || 'Our Store';
  const phone = settings?.phone || '';
  const upiId = settings?.upiId || phone;
  const custName = customer?.name || 'Valued Customer';

  if (lang === 'hi') {
    return `नमस्ते ${custName} जी,\n\n${storeName} से विनम्र निवेदन है कि आपका बकाया उधार राशि ${amountStr} शेष है।\n\nकृपया सुविधानुसार भुगतान (UPI ID: ${upiId}) पर कर दें।\n\nधन्यवाद!\n${storeName}\nसंपर्क: ${phone}`;
  }

  if (lang === 'bn') {
    return `নমস্কার ${custName},\n\n${storeName}-এর পক্ষ থেকে বিনীত অনুরোধ, আপনার বকেয়া ধারের পরিমাণ ${amountStr} বাকি রয়েছে।\n\nঅনুগ্রহ পূর্বক সুবিধা অনুযায়ী (UPI ID: ${upiId}) পেমেন্ট করে দিন।\n\nধন্যবাদ!\n${storeName}\nযোগাযোগ: ${phone}`;
  }

  return `Hello ${custName},\n\nThis is a friendly reminder from ${storeName}. Your pending outstanding balance is ${amountStr}.\n\nPlease kindly clear the payment at your convenience via Cash or UPI (${upiId}).\n\nThank you for your business!\n${storeName}\nContact: ${phone}`;
}

export function generateOrderConfirmationText(
  order: Order,
  settings: StoreSettings,
  lang: LanguageCode = 'en'
): string {
  const itemsText = (order?.items || []).map(i => `• ${i.productName} x ${i.quantity} = ${formatMoney(i.total, settings?.currencySymbol, settings?.currencyCode)}`).join('\n');
  const totalVal = order?.total ?? 0;
  const totalStr = formatMoney(totalVal, settings?.currencySymbol, settings?.currencyCode);
  const storeName = settings?.storeName || 'Our Store';

  if (lang === 'hi') {
    return `नमस्ते ${order?.customerName || 'ग्राहक'} जी,\n\nआपका ऑर्डर #${order?.orderNumber || ''} ${storeName} में प्राप्त हो गया है।\n\nसामान की सूची:\n${itemsText}\n\nकुल राशि: ${totalStr}\nस्थिति: ${order?.orderStatus || ''}\n\nधन्यवाद!\n${storeName}`;
  }

  if (lang === 'bn') {
    return `নমস্কার ${order?.customerName || 'গ্রাহক'},\n\nআপনার অর্ডার #${order?.orderNumber || ''} ${storeName}-এ গ্রহণ করা হয়েছে।\n\nপণ্যের তালিকা:\n${itemsText}\n\nমোট পরিমাণ: ${totalStr}\nঅবস্থা: ${order?.orderStatus || ''}\n\nধন্যবাদ!\n${storeName}`;
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
  const totalStr = formatMoney(order?.total, settings?.currencySymbol, settings?.currencyCode);

  if (lang === 'hi') {
    return `नमस्ते ${order?.customerName || 'ग्राहक'} जी,\n\n${storeName} से आपके ऑर्डर #${order?.orderNumber || ''} की अपडेट:\n\nऑर्डर स्थिति: ${statusStr}\nकुल राशि: ${totalStr}\n\nसंपर्क: ${phone}\nधन्यवाद!`;
  }

  if (lang === 'bn') {
    return `নমস্কার ${order?.customerName || 'গ্রাহক'},\n\n${storeName} থেকে আপনার অর্ডার #${order?.orderNumber || ''}-এর আপডেট:\n\nঅর্ডারের অবস্থা: ${statusStr}\nমোট পরিমাণ: ${totalStr}\n\nযোগাযোগ: ${phone}\nধন্যবাদ!`;
  }

  return `Hello ${order?.customerName || 'Customer'},\n\nUpdate on your Order #${order?.orderNumber || ''} from ${storeName}:\n\nStatus: ${statusStr}\nTotal Amount: ${totalStr}\n\nContact: ${phone}\nThank you!`;
}

export function generateInvoiceWhatsAppText(
  sale: Sale,
  settings: StoreSettings,
  lang: LanguageCode = 'en'
): string {
  const formatAmt = (num?: number | null) => formatMoney(num, settings?.currencySymbol, settings?.currencyCode);

  const itemsText = (sale?.items || [])
    .map(i => {
      const itemGst = i.gstRate ? ` [GST ${i.gstRate}%]` : '';
      return `• ${i.productName}${itemGst} (${i.quantity}) = ${formatMoney(i.totalPrice, settings?.currencySymbol, settings?.currencyCode)}`;
    })
    .join('\n');

  const subtotal = sale?.subtotal ?? 0;
  const discount = sale?.discount ?? 0;
  const gstRate = sale?.gstRate ?? 0;
  const totalTaxAmount = sale?.totalTaxAmount ?? 0;
  const grandTotal = sale?.grandTotal ?? 0;
  const storeName = settings?.storeName || 'Our Store';

  // Build financial breakdown lines
  const breakdownLines: string[] = [];

  if (subtotal > 0 && (discount > 0 || totalTaxAmount > 0)) {
    breakdownLines.push(`Subtotal: ${formatAmt(subtotal)}`);
  }

  if (discount > 0) {
    breakdownLines.push(`Discount: -${formatAmt(discount)}`);
  }

  if (totalTaxAmount > 0) {
    if (sale.cgstAmount && sale.sgstAmount && sale.cgstAmount > 0) {
      const halfRate = (gstRate / 2).toString();
      breakdownLines.push(`CGST (${halfRate}%): +${formatAmt(sale.cgstAmount)}`);
      breakdownLines.push(`SGST (${halfRate}%): +${formatAmt(sale.sgstAmount)}`);
    } else if (sale.igstAmount && sale.igstAmount > 0) {
      breakdownLines.push(`IGST (${gstRate}%): +${formatAmt(sale.igstAmount)}`);
    } else {
      breakdownLines.push(`GST Charged (${gstRate}%): +${formatAmt(totalTaxAmount)}`);
    }
  }

  if (sale.receivedAmount && sale.receivedAmount > 0) {
    breakdownLines.push(`Received Amount: ${formatAmt(sale.receivedAmount)}`);
  }
  if (sale.changeAmount && sale.changeAmount > 0) {
    breakdownLines.push(`Change Returned: ${formatAmt(sale.changeAmount)}`);
  }

  const breakdownText = breakdownLines.length > 0 ? breakdownLines.join('\n') + '\n' : '';
  const totalStr = formatAmt(grandTotal);

  if (lang === 'hi') {
    return `नमस्ते ${sale?.customerName || 'ग्राहक'} जी,\n\n${storeName} से खरीदारी का बिल #${sale?.saleNumber || ''}:\n\n${itemsText}\n\n${breakdownText}कुल राशि (Grand Total): ${totalStr}\nभुगतान प्रकार: ${sale?.paymentMethod || ''}\n\nधन्यवाद! फिर पधारें।`;
  }

  if (lang === 'bn') {
    return `নমস্কার ${sale?.customerName || 'গ্রাহক'},\n\n${storeName} থেকে কেনাকাটার বিল #${sale?.saleNumber || ''}:\n\n${itemsText}\n\n${breakdownText}মোট মূল্য (Grand Total): ${totalStr}\nপেমেন্টের মাধ্যম: ${sale?.paymentMethod || ''}\n\nধন্যবাদ! আবার আসবেন।`;
  }

  return `Hello ${sale?.customerName || 'Valued Customer'},\n\nBill Invoice #${sale?.saleNumber || ''} from ${settings?.storeName || 'Our Store'}:\n\n${itemsText}\n\n${breakdownText}Grand Total: ${totalStr}\nPayment Method: ${sale?.paymentMethod || ''}\n\nThank you for shopping with us!`;
}

export function getWhatsAppWebLink(mobile: string, text: string): string {
  const formattedMobile = sanitizeMobile(mobile);
  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${formattedMobile}?text=${encodedText}`;
}

export function getSmsLink(mobile: string, text: string): string {
  const formattedMobile = sanitizeMobile(mobile);
  const encodedText = encodeURIComponent(text);
  return `sms:+${formattedMobile}?body=${encodedText}`;
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
