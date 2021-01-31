import benchmark from "benchmark"
import { sendBenchmarkResultsToApiServer } from "./sendBenchmarkResultsToApiServer.js";
import { initializeBenchmark } from "./initializeBenchmark.js";

const testsAmount = 256;


for (let sizeMultiplier = 1; sizeMultiplier <= testsAmount; sizeMultiplier++) {
	const suite = new benchmark.Suite;
	const len = sizeMultiplier * 2

	const benchmarkStateArray = new initializeBenchmark(len);
	const incrementingFunction = (el, index) => index.toString(30);
	const arrayForBenchmark = benchmarkStateArray.baseArray;

	benchmarkStateArray._map(incrementingFunction)

	console.log(`${sizeMultiplier}. Benchmarking for ${len} values. ${testsAmount - sizeMultiplier} benchmarks left to start`);

	const concatReduce = () => arrayForBenchmark.reduce((acc, cur) => acc + cur, "");
	const concatJoin = () => arrayForBenchmark.join("");
	const concatToString = () => arrayForBenchmark.toString().replace(/[,]+/g, '');
	const concatFor = () => {
		"use strict"
		let baseString = "";
		for (let forIt = 0; forIt < len; forIt++) {
			baseString += arrayForBenchmark[forIt];
		}
		return baseString;
	}
	const concatForConcat = () => {
		"use strict"
		let baseString = "";
		for (let forIt = 0; forIt < len; forIt++) {
			baseString = baseString.concat(arrayForBenchmark[forIt]);
		}
		return baseString;
	}
	const concatRecursive = (baseStr = "", recIt = 0) => {
		return recIt < len ? concatRecursive(baseStr + arrayForBenchmark[recIt], ++recIt) : baseStr
	}
	const concatRecursiveUsingConcat = (baseStr = "", recIt = 0) => {
		return recIt < len ? concatRecursiveUsingConcat(baseStr.concat(arrayForBenchmark[recIt]), ++recIt) : baseStr
	}
	const concatTailRecursive = (baseStr = "", recIt = 0) => {
		return recIt >= len ? baseStr : concatTailRecursive(baseStr + arrayForBenchmark[recIt], ++recIt);
	}
	const concatTailRecursiveUsingConcat = (baseStr = "", recIt = 0) => {
		return recIt >= len ? baseStr : concatTailRecursiveUsingConcat(baseStr.concat(arrayForBenchmark[recIt]) , ++recIt);
	}
	suite
		.add('concat with reduce()', concatReduce)
		.add('concat with join()', concatJoin)
		.add('concat with toString()', concatToString)
		.add('concat with for loop and + operator', concatFor)
		.add('concat with for and concat function', concatForConcat)
		.add('concat recursive with + operator', concatRecursive)
		.add('concat tail recursive with + operator', concatTailRecursive)
		.add('concat recursive with concat function', concatRecursiveUsingConcat)
		.on('cycle', (ev) => {
			// Resetting values;
			benchmarkStateArray._map(incrementingFunction)
			console.log("\t", len, String(ev.target));
		})
		.on('complete', (ev) => {
			const connect = new sendBenchmarkResultsToApiServer(ev, 'array_size', len);
			connect._send('string_concat');
		})
		.run({async: true});
}

