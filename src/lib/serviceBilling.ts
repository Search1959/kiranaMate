import { Appointment, JobCard, ServiceCustomer } from '../types';
import { serviceStore } from './serviceStore';

/**
 * "Bill this" hand-offs into the Service POS. Each one loads a one-shot draft
 * (client + lines) that the POS picks up when it opens, so nothing is retyped;
 * the POS then links the invoice back to the source so it shows as Billed.
 */

export function startBillFromAppointment(app: Appointment) {
  const advance = app.paidAmount || 0;
  const balance = Math.max(0, app.totalAmount - advance);
  const catalog = serviceStore.getServices().find(s => s.id === app.serviceId);
  // With an advance already collected, bill only the balance so the client
  // isn't charged twice; otherwise use the normal catalog line (keeps its GST).
  const line = advance > 0
    ? { name: `${app.serviceName} (balance after ₹${advance} advance)`, price: balance }
    : { serviceId: catalog?.id, name: app.serviceName, price: app.totalAmount || catalog?.price || 0, gstPercent: catalog?.gstPercent };
  serviceStore.setBillDraft({
    customerId: app.customerId,
    customerName: app.customerName,
    mobile: app.mobile,
    appointmentId: app.id,
    note: `Appointment ${app.date} ${app.time}`,
    lines: [{ ...line, staffId: app.staffId, staffName: app.staffName }]
  });
}

export function startBillFromJob(job: JobCard) {
  const balance = Math.max(0, job.totalAmount - (job.paidAmount || 0));
  const label = job.issueDescription ? `${job.jobNo}: ${job.issueDescription}` : job.jobNo;
  serviceStore.setBillDraft({
    customerId: job.customerId,
    customerName: job.customerName,
    mobile: job.mobile,
    jobCardId: job.id,
    note: job.jobNo,
    lines: [{ name: (job.paidAmount || 0) > 0 ? `${label} (balance)` : label, price: balance, staffId: job.assignedStaffId, staffName: job.assignedStaffName }]
  });
}

export function startBillFromCustomer(c: ServiceCustomer) {
  serviceStore.setBillDraft({ customerId: c.id, customerName: c.name, mobile: c.mobile, lines: [] });
}
