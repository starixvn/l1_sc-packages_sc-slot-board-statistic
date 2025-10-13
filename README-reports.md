# Report Reader

This module provides functionality to read and analyze all JSON report files from the `reports` directory.

## Files

- `read-reports.js` - JavaScript version of the report reader
- `read-reports.ts` - TypeScript version with type definitions
- `example-usage.js` - Example script showing how to use the report reader

## Generating Reports

### Running the Cascading Slot Simulator

Use the `cascading-slot` script to generate statistical reports:

```bash
npm run cascading-slot [factor] [multiplier] [batchSize] [times] [singleFactor] [volatility] [buyFreeSpins]
```

### Parameters

1. **factor** (default: 40) - Maximum factor value
2. **multiplier** (default: 10) - Multiplier symbols count
3. **batchSize** (default: 1000) - Number of rounds per batch
4. **times** (default: 10) - Number of times to run the batch
5. **singleFactor** (default: false) - Use "true" to run with a single factor
6. **volatility** (default: "MediumLow") - Options: "MediumLow" or "VeryHigh"
7. **buyFreeSpins** (default: false) - Use "true" to enable buy free spins feature

### Examples

#### Run with default settings

```bash
npm run cascading-slot
```

#### Run with VeryHigh volatility and buyFreeSpins enabled

```bash
npm run cascading-slot 40 10 1000 10 true VeryHigh true
```

#### Run with MediumLow volatility and buyFreeSpins enabled

```bash
npm run cascading-slot 40 10 1000 10 true MediumLow true
```

#### Run with VeryHigh volatility and buyFreeSpins disabled

```bash
npm run cascading-slot 40 10 1000 10 true VeryHigh false
```

#### Custom batch size with 50 iterations

```bash
npm run cascading-slot 40 10 5000 50 true MediumLow false
```

## Analyzing Reports

### Comprehensive Statistical Analysis

Use the `analyze-reports` command to generate a comprehensive statistical analysis of your reports:

```bash
npm run analyze-reports
```

This command will:

- Read all report files from the `reports` directory
- Generate comprehensive statistics including:
  - **RTP Analysis**: Total RTP, Base Game RTP, Bonus Mode RTP, RTP Deviation, and RTP Range
  - **Volatility**: Volatility rating, coefficient of variation, and standard deviation
  - **Max Win**: Maximum win multiplier, frequency, and probability
  - **Frequency Analysis**: Hit frequency, feature hit frequency, multiplier frequency, win 100x bet frequency
  - **Bonus Features**: Buy free spins statistics
- Display a formatted report in the console
- Save the analysis to `analysis-report.json`

### Analysis Output

The analysis includes:

#### 📊 Report Information

- Total rounds simulated
- Total bet amount
- Total payout amount

#### 💰 RTP Analysis

- **Total RTP**: Overall return to player percentage
- **Base Game RTP**: RTP from base game wins (excluding free spins)
- **Bonus Mode RTP**: RTP from free spins/bonus rounds
- **RTP Deviation**: Standard deviation of RTP across batches
- **RTP Range**: Minimum and maximum RTP observed

#### 📈 Volatility

- **Volatility Rating**: Very Low, Low, Medium, High, or Very High
- **Coefficient of Variation**: Statistical measure of volatility
- **Standard Deviation**: RTP standard deviation

#### 🎯 Max Win

- **Max Win**: Maximum win multiplier achieved
- **Max Win Frequency**: How often the max win occurs
- **Max Win Rate**: Average rounds between max wins

#### 🎲 Frequency Analysis

- **Hit Frequency**: Percentage of rounds with any win
- **Feature Hit Frequency**: How often free spins are triggered
- **Extra Free Spin Frequency**: How often additional free spins are won during bonus rounds
- **Multiplier Frequency**: How often multipliers appear
- **Win 100x Bet Frequency**: How often wins exceed 100x the bet

#### 🎁 Bonus Features

- **Total Buy Free Spins**: Number of buy free spins triggered
- **Buy Free Spins Rate**: Percentage of rounds using buy feature

#### 🚀 Free Spins Efficiency

- **Base Game Rounds**: Total base game spins
- **Free Spins Rounds**: Total free spin rounds played
- **Base Game Hit Frequency**: Percentage of base game spins that win
- **Base Game Hit Rate**: Average rounds between base game wins
- **Free Spins Hit Frequency**: Percentage of free spin rounds that win
- **Free Spins Hit Rate**: Average rounds between free spin wins
- **Efficiency Ratio**: How much more likely free spins are to win vs base game (e.g., 1.28x means 28% more likely)
- **Average Base Game Win**: Average payout per base game round
- **Average Free Spin Win**: Average payout per free spin round
- **Payout Multiplier**: How much more profitable each free spin is vs base game (e.g., 1.73x means 73% more)

### Example Output

```
╔══════════════════════════════════════════════════════════════╗
║           CASCADING SLOT STATISTICAL ANALYSIS               ║
╚══════════════════════════════════════════════════════════════╝

📊 REPORT INFORMATION
─────────────────────────────────────────────────────────────
Report File:    report-40-1.json
Total Rounds:   1,374,516
Total Bet:      1327100.00
Total Payout:   1281064.10

💰 RTP ANALYSIS (Return to Player)
─────────────────────────────────────────────────────────────
Total RTP:      79.4157%
Base Game RTP:  68.3200%
Bonus Mode RTP: 11.1114%
RTP Deviation:  18.6054%
RTP Range:      59.4172% - 108.2085%

📈 VOLATILITY
─────────────────────────────────────────────────────────────
Volatility:     Very High
Coefficient:    0.234278
Std Deviation:  0.186054

🎯 MAX WIN
─────────────────────────────────────────────────────────────
Max Win:        72.50x
Max Win Freq:   0.0919%
Max Win Rate:   1 in 1088 rounds

🚀 FREE SPINS EFFICIENCY
─────────────────────────────────────────────────────────────
Base Game Rounds:       5,000
Free Spins Rounds:      470

Base Game Hit Freq:     29.9600%
Base Game Hit Rate:     1 in 3.34 rounds
Free Spins Hit Freq:    38.2979%
Free Spins Hit Rate:    1 in 2.61 rounds
Efficiency Ratio:       1.28x

Avg Base Game Win:      1.8381
Avg Free Spin Win:      3.1802
Payout Multiplier:      1.73x
...
```

## Reading Reports

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
