import { GetStatisticOptions, getStatistics } from "./statistic-runner";
import { boardDefinition, commonDefinition } from "./generator-definition";
import { range, __ } from "ramda";
import { Difficulty } from "sc-slot-board-generator";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { calculateRTP, countMultipliers, countSymbols, countBuyFreeSpinsExtraSpins } from "./statistic-calculator";
import { Volatility } from "sc-slot-board-generator/lib/volatility";

function getSymbolHeuristic(multiplierSymbols: number) {
  return {
    0: 1.2,
    1: 10 / 9,
    2: 1.2,
    3: 1.25,
    4: 1.2,
    5: 1.25,
    6: 1.25,
    7: 2,
    8: 1,
    9: 2 / 3,
    10: multiplierSymbols,
  };
}

function getNumberOfSymbols(factor: number, multiplierSymbols: number) {
  return {
    0: 118,
    1: 98,
    2: 88,
    3: 73,
    4: 58,
    5: 48,
    6: 38,
    7: 30,
    8: 15,
    9: 10,
    10: 2,
  };
}

let count = 1;

function getRunnerOptions(
  factor: number,
  multiplierSymbols: number,
  batchSize: number = 1000,
  times: number = 2,
  coinValues = [0.1],
  betLevels = [5]
): GetStatisticOptions {
  const numberOfSymbols = getNumberOfSymbols(factor, multiplierSymbols);

  return {
    betLevels,
    coinValues,
    times,
    batchOptions: {
      betLevel: 5,
      coinValue: 0.1,
      debug: false,
      difficulty: Difficulty.Easy, // Not use anymore
      multiplierSettings: commonDefinition.multiplier,
      modeSettings: {},
      numberOfRounds: batchSize,
      betAmounts: coinValues.flatMap((coinValue) => betLevels.map((betLevel) => ({ coinValue, betLevel }))),
      volatility: Volatility.MediumLow, // Volatility.VeryHigh
    },
  };
}

function generateReportWithSingleFactor(
  factor: number,
  multiplierSymbols: number,
  batchSize: number = 1000,
  times: number = 2,
  coinValues = [0.1],
  betLevels = [1]
) {
  const options = getRunnerOptions(factor, multiplierSymbols, batchSize, times, coinValues, betLevels);
  const { statistics } = getStatistics(options);
  const totalRounds = statistics.reduce((acc, statistic) => acc + statistic.totalRounds, 0);
  const report = calculateRTP(statistics, totalRounds);
  const symbols = countSymbols(statistics);
  const configs = options.batchOptions.modeSettings[options.batchOptions.volatility];
  const multipliers = countMultipliers(statistics);
  const buyFreeSpinsExtraSpins = countBuyFreeSpinsExtraSpins(statistics);
  const totalPayout = statistics.reduce((acc, statistic) => acc + statistic.totalPayout, 0);
  const totalBet = statistics.reduce((acc, statistic) => acc + statistic.totalBetAmount, 0);

  const reportWithTotals = {
    ...report,
    totalPayout,
    totalBet,
  };

  return { report: reportWithTotals, symbols, configs, multipliers, buyFreeSpinsExtraSpins };
}

function generateReport(
  maximumFactor: number,
  multiplierSymbols: number,
  batchSize: number = 1000,
  times: number = 2,
  betCoins = [0.1],
  betLevels = [5],
  singleFactor: boolean = false,
  runner: number = 1
) {
  console.log({ maximumFactor, multiplierSymbols, batchSize, times });
  const result = [];

  if (singleFactor) {
    const data = generateReportWithSingleFactor(maximumFactor, multiplierSymbols, batchSize, times, betCoins, betLevels);

    result.push(data);
  } else {
    for (let factor = 12; factor <= maximumFactor; factor++) {
      const data = generateReportWithSingleFactor(factor, multiplierSymbols, batchSize, times, betCoins, betLevels);

      result.push(data);

      console.log(data.report, data.configs);

      writeFileSync(`reports/report-${runner}-${batchSize}-${times}-${maximumFactor}-${multiplierSymbols}.json`, JSON.stringify(result, null, 2));
    }
  }

  writeFileSync(`reports/report-${runner}-${count++}.json`, JSON.stringify(result, null, 2));

  return result;
}

const factor = Number(process.argv[2] || 40);
const multiplier = Number(process.argv[3] || 10);
const batchSize = Number(process.argv[4] || 1000);
const times = Number(process.argv[5] || 10);
const singleFactor = process.argv[6] === "true";
const betCoins = [0.05, 0.1, 0.25];
const betLevels = [1];

!existsSync("reports") && mkdirSync("reports");
generateReport(factor, multiplier, batchSize, times, betCoins, betLevels, true, Number(process.argv[2] || 1));
