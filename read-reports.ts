import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

// Get the directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Type definitions
interface ReportData {
  report: {
    rtp: number;
    rtps: number[];
    rtpDeviation: number;
    multiplierRatio: number;
    freeSpinsRatio: number;
    tumbleWinRatio: number;
    maxWin: number;
    hitMaxWin: number;
    aboveThousandWins: number;
  };
  symbols: Record<string, number[] | number>;
}

interface ReportEntry {
  filename: string;
  reportNumber: number;
  data: ReportData;
}

interface ReportSummary {
  totalReports: number;
  reportRange: {
    first: number;
    last: number;
  };
  rtpStats: {
    min: number;
    max: number;
    avg: number;
  };
  maxWinStats: {
    min: number;
    max: number;
    avg: number;
  };
  tumbleWinStats: {
    min: number;
    max: number;
    avg: number;
  };

  multiplierStats: {
    min: number;
    max: number;
    avg: number;
  };
  freeSpinsStats: {
    min: number;
    max: number;
    avg: number;
  };
  hitMaxWinStats: {
    min: number;
    max: number;
    avg: number;
  };
}

/**
 * Reads all report files from the reports directory and collects them into an array
 * @returns {ReportEntry[]} Array of parsed report objects
 */
function readAllReports(): ReportEntry[] {
  const reportsDir = path.join(__dirname, "reports");
  const reports: ReportEntry[] = [];

  try {
    // Read all files in the reports directory
    const files = fs.readdirSync(reportsDir);

    // Filter for JSON files that match the report pattern
    const reportFiles = files.filter((file) => file.endsWith(".json") && file.startsWith("report-"));

    // Sort files numerically by their report number
    reportFiles.sort((a, b) => {
      const matchA = a.match(/report-(\d+)/);
      const matchB = b.match(/report-(\d+)/);
      if (!matchA || !matchB) return 0;

      const numA = parseInt(matchA[1]);
      const numB = parseInt(matchB[1]);
      return numA - numB;
    });

    console.log(`Found ${reportFiles.length} report files`);

    // Read and parse each report file
    for (const file of reportFiles) {
      try {
        const filePath = path.join(reportsDir, file);
        const fileContent = fs.readFileSync(filePath, "utf8");
        const reportData = JSON.parse(fileContent) as ReportData[];

        // Each report file contains an array with one object
        if (Array.isArray(reportData) && reportData.length > 0) {
          const match = file.match(/report-(\d+)/);
          if (match) {
            reports.push({
              filename: file,
              reportNumber: parseInt(match[1]),
              data: reportData[0], // Extract the actual report object
            });
          }
        }

        console.log(`✓ Loaded ${file}`);
      } catch (error) {
        console.error(`✗ Error reading ${file}:`, error instanceof Error ? error.message : String(error));
      }
    }

    console.log(`\nSuccessfully loaded ${reports.length} reports`);
    return reports;
  } catch (error) {
    console.error("Error reading reports directory:", error instanceof Error ? error.message : String(error));
    return [];
  }
}

/**
 * Get summary statistics from all reports
 * @param {ReportEntry[]} reports - Array of report objects
 * @returns {ReportSummary} Summary statistics
 */
function getReportSummary(reports: ReportEntry[]): ReportSummary | { error: string } {
  if (reports.length === 0) {
    return { error: "No reports found" };
  }

  const rtpValues = reports.map((r) => r.data.report.rtp);
  const maxWinValues = reports.map((r) => r.data.report.maxWin);
  const tumbleWinValues = reports.map((r) => r.data.report.tumbleWinRatio);
  const multiplierValues = reports.map((r) => r.data.report.multiplierRatio);
  const freeSpinsValues = reports.map((r) => r.data.report.freeSpinsRatio);
  const hitMaxWinValues = reports.map((r) => r.data.report.hitMaxWin);

  return {
    totalReports: reports.length,
    reportRange: {
      first: reports[0].reportNumber,
      last: reports[reports.length - 1].reportNumber,
    },
    rtpStats: {
      min: Math.min(...rtpValues),
      max: Math.max(...rtpValues),
      avg: rtpValues.reduce((sum, val) => sum + val, 0) / rtpValues.length,
    },
    maxWinStats: {
      min: Math.min(...maxWinValues),
      max: Math.max(...maxWinValues),
      avg: maxWinValues.reduce((sum, val) => sum + val, 0) / maxWinValues.length,
    },
    tumbleWinStats: {
      min: Math.min(...tumbleWinValues),
      max: Math.max(...tumbleWinValues),
      avg: tumbleWinValues.reduce((sum, val) => sum + val, 0) / tumbleWinValues.length,
    },
    multiplierStats: {
      min: Math.min(...multiplierValues),
      max: Math.max(...multiplierValues),
      avg: multiplierValues.reduce((sum, val) => sum + val, 0) / multiplierValues.length,
    },
    freeSpinsStats: {
      min: Math.min(...freeSpinsValues),
      max: Math.max(...freeSpinsValues),
      avg: freeSpinsValues.reduce((sum, val) => sum + val, 0) / freeSpinsValues.length,
    },
    hitMaxWinStats: {
      min: Math.min(...hitMaxWinValues),
      max: Math.max(...hitMaxWinValues),
      avg: hitMaxWinValues.reduce((sum, val) => sum + val, 0) / hitMaxWinValues.length,
    },
  };
}

/**
 * Filter reports by report number range
 * @param {ReportEntry[]} reports - Array of report objects
 * @param {number} start - Start report number (inclusive)
 * @param {number} end - End report number (inclusive)
 * @returns {ReportEntry[]} Filtered reports
 */
function filterReportsByRange(reports: ReportEntry[], start: number, end: number): ReportEntry[] {
  return reports.filter((report) => report.reportNumber >= start && report.reportNumber <= end);
}

/**
 * Get reports with RTP above a certain threshold
 * @param {ReportEntry[]} reports - Array of report objects
 * @param {number} threshold - RTP threshold
 * @returns {ReportEntry[]} Reports with RTP above threshold
 */
function getReportsWithHighRTP(reports: ReportEntry[], threshold: number): ReportEntry[] {
  return reports.filter((report) => report.data.report.rtp > threshold);
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("Reading all reports...\n");

  const allReports = readAllReports();

  if (allReports.length > 0) {
    console.log("\n=== REPORT SUMMARY ===");
    const summary = getReportSummary(allReports);
    console.log(JSON.stringify(summary, null, 2));

    console.log("\n=== SAMPLE REPORT STRUCTURE ===");
    console.log("First report keys:", Object.keys(allReports[0].data));
    console.log("Report data keys:", Object.keys(allReports[0].data.report));
    console.log("Symbols count:", Object.keys(allReports[0].data.symbols).length);

    // Example: Get reports with RTP > 0.95
    const highRTPReports = getReportsWithHighRTP(allReports, 0.95);
    console.log(`\nReports with RTP > 0.95: ${highRTPReports.length}`);
  }
}

// Export functions for use in other modules
export { readAllReports, getReportSummary, filterReportsByRange, getReportsWithHighRTP, type ReportEntry, type ReportData, type ReportSummary };
