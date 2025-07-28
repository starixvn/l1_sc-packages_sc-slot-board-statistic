# Report Reader

This module provides functionality to read and analyze all JSON report files from the `reports` directory.

## Files

- `read-reports.js` - JavaScript version of the report reader
- `read-reports.ts` - TypeScript version with type definitions
- `example-usage.js` - Example script showing how to use the report reader

## Usage

### Basic Usage

```javascript
import { readAllReports, getReportSummary } from "./read-reports.js";

// Read all reports
const allReports = readAllReports();

// Get summary statistics
const summary = getReportSummary(allReports);
console.log(summary);
```

### Available Functions

#### `readAllReports()`

Reads all JSON report files from the `reports` directory and returns an array of report objects.

**Returns:** Array of `ReportEntry` objects with the following structure:

```javascript
{
  filename: string,        // Original filename (e.g., "report-2166-1.json")
  reportNumber: number,    // Extracted report number (e.g., 2166)
  data: ReportData         // The actual report data
}
```

#### `getReportSummary(reports)`

Generates summary statistics from an array of reports.

**Parameters:**

- `reports` - Array of report objects

**Returns:** Summary object with:

```javascript
{
  totalReports: number,
  reportRange: {
    first: number,
    last: number
  },
  rtpStats: {
    min: number,
    max: number,
    avg: number
  },
  maxWinStats: {
    min: number,
    max: number,
    avg: number
  }
}
```

#### `filterReportsByRange(reports, start, end)`

Filters reports by report number range.

**Parameters:**

- `reports` - Array of report objects
- `start` - Start report number (inclusive)
- `end` - End report number (inclusive)

#### `getReportsWithHighRTP(reports, threshold)`

Filters reports with RTP above a certain threshold.

**Parameters:**

- `reports` - Array of report objects
- `threshold` - RTP threshold (e.g., 0.95)

## Report Data Structure

Each report contains:

```javascript
{
  report: {
    rtp: number,                    // Return to Player percentage
    rtps: number[],                 // Array of RTP values
    rtpDeviation: number,           // RTP deviation
    multiplierRatio: number,        // Multiplier ratio
    freeSpinsRatio: number,         // Free spins ratio
    tumbleWinRatio: number,         // Tumble win ratio
    maxWin: number,                 // Maximum win amount
    hitMaxWin: number,              // Hit max win probability
    aboveThousandWins: number       // Above thousand wins probability
  },
  symbols: Record<string, number[]> // Symbol frequency data
}
```

## Examples

### Run the example script

```bash
node example-usage.js
```

### Run the TypeScript version

```bash
npx ts-node read-reports.ts
```

### Filter reports by range

```javascript
import { readAllReports, filterReportsByRange } from "./read-reports.js";

const allReports = readAllReports();
const reports2000to2100 = filterReportsByRange(allReports, 2000, 2100);
console.log(`Found ${reports2000to2100.length} reports in range 2000-2100`);
```

### Find high RTP reports

```javascript
import { readAllReports, getReportsWithHighRTP } from "./read-reports.js";

const allReports = readAllReports();
const highRTPReports = getReportsWithHighRTP(allReports, 0.98);
console.log(`Found ${highRTPReports.length} reports with RTP > 98%`);
```

## Performance Notes

- The script reads all files synchronously for simplicity
- For large numbers of reports, consider implementing async reading
- Reports are automatically sorted by report number
- Error handling is included for malformed JSON files

## TypeScript Support

The TypeScript version includes full type definitions:

```typescript
import {
  readAllReports,
  getReportSummary,
  filterReportsByRange,
  getReportsWithHighRTP,
  type ReportEntry,
  type ReportData,
  type ReportSummary,
} from "./read-reports.js";
```
