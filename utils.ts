import { Student } from './types.ts';

export const formatDateTime = (isoString?: string): string => {
  if (!isoString) return 'N/A';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } catch (error) {
    return 'Invalid Date';
  }
};

export const formatDate = (isoString?: string): string => {
  if (!isoString) return 'N/A';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString();
  } catch (error) {
    return 'Invalid Date';
  }
};

export const formatISODateToYMD = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  } catch (e) {
    return '';
  }
};


export const calculateFeeDetails = (student: Student) => {
  const totalPaid = student.payments.reduce((sum, p) => sum + p.amount, 0);
  const totalDiscount = student.discounts.reduce((sum, d) => sum + d.amount, 0);
  const remainingBalance = student.totalFees - totalPaid - totalDiscount;
  const lastPayment = student.payments.length > 0 ? student.payments.reduce((latest, p) => new Date(p.date) > new Date(latest.date) ? p : latest) : null;
  return { totalPaid, totalDiscount, remainingBalance, lastPaymentDate: lastPayment ? lastPayment.date : null };
};