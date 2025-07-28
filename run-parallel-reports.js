import { spawn } from "child_process";
import { writeFileSync, readFileSync, existsSync } from "fs";

class ParallelReportRunner {
  constructor(maxConcurrent = 5) {
    this.maxConcurrent = maxConcurrent;
    this.runningProcesses = new Map();
    this.nextReportNumber = this.getNextReportNumber();
    this.completedReports = new Set();
    this.failedReports = new Set();
  }

  getNextReportNumber() {
    const stateFile = "report-state.json";
    if (existsSync(stateFile)) {
      try {
        const state = JSON.parse(readFileSync(stateFile, "utf8"));
        return state.nextReportNumber || 1;
      } catch (error) {
        console.log("Error reading state file, starting from 1");
        return 1;
      }
    }
    return 1;
  }

  saveState() {
    const state = {
      nextReportNumber: this.nextReportNumber,
      completedReports: Array.from(this.completedReports),
      failedReports: Array.from(this.failedReports),
    };
    writeFileSync("report-state.json", JSON.stringify(state, null, 2));
  }

  async runReport(reportNumber) {
    return new Promise((resolve, reject) => {
      console.log(`🚀 Starting report ${reportNumber}`);

      const child = spawn("yarn", ["cascading-slot", reportNumber.toString()], {
        stdio: ["inherit", "pipe", "pipe"],
        shell: true,
      });

      let output = "";
      let errorOutput = "";

      child.stdout.on("data", (data) => {
        const text = data.toString();
        output += text;
        process.stdout.write(`[Report ${reportNumber}] ${text}`);
      });

      child.stderr.on("data", (data) => {
        const text = data.toString();
        errorOutput += text;
        process.stderr.write(`[Report ${reportNumber}] ERROR: ${text}`);
      });

      child.on("close", (code) => {
        console.log(`\n✅ Report ${reportNumber} finished with code ${code}`);

        if (code === 0) {
          this.completedReports.add(reportNumber);
          console.log(`📊 Completed reports: ${this.completedReports.size}`);
        } else {
          this.failedReports.add(reportNumber);
          console.log(`❌ Failed reports: ${this.failedReports.size}`);
        }

        this.saveState();
        resolve({ reportNumber, code, output, errorOutput });
      });

      child.on("error", (error) => {
        console.error(`❌ Report ${reportNumber} failed to start:`, error.message);
        this.failedReports.add(reportNumber);
        this.saveState();
        reject(error);
      });

      this.runningProcesses.set(reportNumber, child);
    });
  }

  async startNextReport() {
    if (this.runningProcesses.size >= this.maxConcurrent) {
      return;
    }

    const reportNumber = this.nextReportNumber++;

    try {
      await this.runReport(reportNumber);
    } catch (error) {
      console.error(`Failed to run report ${reportNumber}:`, error.message);
    } finally {
      this.runningProcesses.delete(reportNumber);
      this.startNextReport(); // Start the next one
    }
  }

  async run() {
    console.log(`🎯 Starting parallel report runner with ${this.maxConcurrent} concurrent processes`);
    console.log(`📈 Next report number: ${this.nextReportNumber}`);
    console.log(`✅ Completed reports: ${this.completedReports.size}`);
    console.log(`❌ Failed reports: ${this.failedReports.size}`);
    console.log("");

    // Start initial batch
    const initialBatch = Math.min(this.maxConcurrent, 5);
    for (let i = 0; i < initialBatch; i++) {
      this.startNextReport();
    }

    // Keep the process alive
    setInterval(() => {
      if (this.runningProcesses.size === 0) {
        console.log("🎉 All reports completed!");
        process.exit(0);
      }
    }, 5000);
  }

  stop() {
    console.log("\n🛑 Stopping all running processes...");
    for (const [reportNumber, child] of this.runningProcesses) {
      console.log(`Stopping report ${reportNumber}`);
      child.kill("SIGTERM");
    }
    this.saveState();
  }
}

// Handle graceful shutdown
const runner = new ParallelReportRunner(5);

process.on("SIGINT", () => {
  console.log("\n🛑 Received SIGINT, shutting down gracefully...");
  runner.stop();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n🛑 Received SIGTERM, shutting down gracefully...");
  runner.stop();
  process.exit(0);
});

// Start the runner
runner.run().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
