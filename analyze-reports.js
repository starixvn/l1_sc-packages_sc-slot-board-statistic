import { readAllReports, getReportSummary } from "./read-reports.js";

console.log("=== REPORT READER EXAMPLE ===\n");

// Read all reports
const allReports = readAllReports();

if (allReports.length > 0) {
  console.log(`Successfully loaded ${allReports.length} reports`);

  // Get summary statistics
  const summary = getReportSummary(allReports);
  const rtps = allReports.flatMap((report) => report.data.report.rtps);
  console.log("\nSummary:", JSON.stringify(summary, null, 2));

  // Show first few reports
  console.log(`=== RTP > 1 WITH 50,000 rounds ${rtps.filter((rtp) => rtp > 1).length / rtps.length} ===`);

  console.log("\n=== REPORTS RTP > 1 ===");
  const sortedByRTP = [...allReports].filter((report) => report.data.report.rtp > 1).sort((a, b) => b.data.report.rtp - a.data.report.rtp);
  console.log(`=== RTP > 1 WITH 500,000 rounds ${sortedByRTP.filter((rtp) => rtp > 1).length / sortedByRTP.length} ===`);

  sortedByRTP.forEach((report, index) => {
    console.log(`${index + 1}. ${report.filename}: RTP = ${report.data.report.rtp.toFixed(4)}`);
  });

  console.log("\n=== TOP 10 REPORTS BY RTP ===");
  const topMaxWin = [...allReports].sort((a, b) => b.data.report.maxWin - a.data.report.maxWin);
  topMaxWin.slice(0, 10).forEach((report, index) => {
    console.log(`${index + 1}. ${report.filename}: Max Win = ${report.data.report.maxWin}`);
  });
} else {
  console.log("No reports found or error occurred");
}
