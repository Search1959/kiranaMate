import QRCode from 'qrcode';

/** Builds a standard NPCI UPI deep link — scanning it in GPay/PhonePe/Paytm
 * etc. opens the app with payee, amount and a note already filled in, ready
 * for the client to confirm and pay. */
export function buildUpiPaymentLink(params: {
  upiId: string;
  payeeName: string;
  amount: number;
  note?: string;
}): string {
  const query = new URLSearchParams({
    pa: params.upiId,
    pn: params.payeeName,
    am: params.amount.toFixed(2),
    cu: 'INR'
  });
  if (params.note) query.set('tn', params.note);
  return `upi://pay?${query.toString()}`;
}

/** Renders a UPI payment link as a QR code PNG data URL — generated entirely
 * client-side (no external image service), so it works offline and when the
 * invoice is printed/saved as a PDF. */
export function generateUpiQrDataUrl(upiLink: string): Promise<string> {
  return QRCode.toDataURL(upiLink, { margin: 1, width: 200 });
}
