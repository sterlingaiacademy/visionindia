export interface NormalizedLog {
  borrowerName: string;
  phoneNumber: string;
  callDate: string;
  portfolioDisplay: string;
  disposition: string;
  settlementOffer: string;
  ptpDate: string;
  ptpTime: string;
  direction: string;
  loanAccount: string;
  amountDue: string;
  callSummary: string;
  [key: string]: any;
}

export function normalizeLog(log: any): NormalizedLog {
  if (!log) return {} as NormalizedLog;

  const borrowerName = (
    log["borrowerName"] || log["Customer Name"] || log["Borrower Name"] || 
    log["borrower"] || log["Name"] || log["name"] || ""
  ).trim();

  const phoneNumber = (
    log["phoneNumber"] || log["Phone Number"] || log["Phone"] || 
    log["phone"] || log["Mobile"] || log["Contact"] || ""
  ).trim();

  const callDate = (
    log["callDate"] || log["Call Date"] || log["Date"] || 
    log["timestamp"] || log["Timestamp"] || ""
  ).trim();

  let portfolioDisplay = (
    log["portfolioDisplay"] || log["Bank Name"] || log["Portfolio"] || 
    log["Vehicle Model"] || log["bank"] || ""
  ).trim();

  // Normalize any leftover automotive labels to financial portfolios
  if (portfolioDisplay.toLowerCase().includes("xuv seven") || portfolioDisplay.toLowerCase().includes("xuv700")) {
    portfolioDisplay = "Federal Bank";
  } else if (portfolioDisplay.toLowerCase().includes("xuv three") || portfolioDisplay.toLowerCase().includes("xuv300")) {
    portfolioDisplay = "HDFC Bank";
  } else if (portfolioDisplay.toLowerCase().includes("scorpio")) {
    portfolioDisplay = "Muthoot Fin";
  } else if (portfolioDisplay.toLowerCase().includes("thar")) {
    portfolioDisplay = "SBI SARFAESI";
  }

  const disposition = (
    log["disposition"] || log["Enquiry Type"] || log["Status"] || 
    log["Disposition"] || ""
  ).trim();

  const settlementOffer = (
    log["settlementOffer"] || log["Service Type"] || log["Settlement"] || 
    log["Settlement Offer"] || ""
  ).trim();

  const ptpDate = (
    log["ptpDate"] || log["Visit Day"] || log["PTP Date"] || 
    log["Promise Date"] || ""
  ).trim();

  const ptpTime = (
    log["ptpTime"] || log["Visit Time"] || log["PTP Time"] || ""
  ).trim();

  const direction = (
    log["direction"] || log["Direction"] || log["Type"] || 
    log["Call Type"] || "Inbound"
  ).trim();

  const loanAccount = (
    log["loanAccount"] || log["Loan Account"] || log["Account Number"] || ""
  ).trim();

  const amountDue = (
    log["amountDue"] || log["Amount Due"] || log["Overdue Amount"] || ""
  ).trim();

  const callSummary = (
    log["callSummary"] || log["Call Summary"] || log["Summary"] || ""
  ).trim();

  const finalBorrower = borrowerName && borrowerName !== "-" ? borrowerName : "Unknown";
  const finalPhone = phoneNumber && phoneNumber !== "-" ? phoneNumber : "-";
  const finalDate = callDate && callDate !== "-" ? callDate : "-";
  const finalPortfolio = portfolioDisplay && portfolioDisplay !== "-" ? portfolioDisplay : "Vision India";
  const finalDisposition = disposition && disposition !== "-" ? disposition : "General Inbound";
  const finalSettlement = settlementOffer && settlementOffer !== "-" ? settlementOffer : "";
  const finalPtpDate = ptpDate && ptpDate !== "-" ? ptpDate : "";
  const finalPtpTime = ptpTime && ptpTime !== "-" ? ptpTime : "";
  const finalLoanAccount = loanAccount && loanAccount !== "-" ? loanAccount : "";
  const finalAmountDue = amountDue && amountDue !== "-" ? amountDue : "";
  const finalCallSummary = callSummary && callSummary !== "-" ? callSummary : "";

  return {
    ...log,
    borrowerName: finalBorrower,
    phoneNumber: finalPhone,
    callDate: finalDate,
    portfolioDisplay: finalPortfolio,
    disposition: finalDisposition,
    settlementOffer: finalSettlement,
    ptpDate: finalPtpDate,
    ptpTime: finalPtpTime,
    direction: direction || "Inbound",
    loanAccount: finalLoanAccount,
    amountDue: finalAmountDue,
    callSummary: finalCallSummary,

    // Backward-compatibility keys for existing code
    "Customer Name": finalBorrower,
    "Phone Number": finalPhone,
    "Call Date": finalDate,
    "Vehicle Model": finalPortfolio,
    "Bank Name": finalPortfolio,
    "Enquiry Type": finalDisposition,
    "Service Type": finalSettlement,
    "Visit Day": finalPtpDate,
    "Visit Time": finalPtpTime,
    "Call Summary": finalCallSummary,
  };
}

export function normalizeLogs(logs: any[]): NormalizedLog[] {
  if (!Array.isArray(logs)) return [];
  return logs.map(normalizeLog);
}
