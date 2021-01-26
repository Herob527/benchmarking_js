import benchmark from "benchmark"
import { sendBenchmarkResultsToApiServer } from "./sendBenchmarkResultsToApiServer.js";
import { initializeBenchmark } from "./initializeBenchmark.js";

const benchmarkValues = new initializeBenchmark(2 ** 10);

benchmarkValues._map(() => Math.round(Math.random() * 30).toString(30));

const chunkAmount = 512;
const chunkedArray = benchmarkValues.chunkArray(chunkAmount)


for (let counter = 0; counter < chunkAmount; counter++) {
	const suite = new benchmark.Suite;
	let arrayForBenchmark = [];
	for (let pushIndex = 0; pushIndex <= counter; pushIndex++) {
		arrayForBenchmark.push(chunkedArray[pushIndex]);
	}
	arrayForBenchmark = arrayForBenchmark.flat(Infinity)

	const length = arrayForBenchmark.length;
	const benchmarksIncoming = chunkAmount - counter - 1;
	console.log(`\n${counter + 1} : Started benchmarking for ${length} ${length > 1 ? "elements" : "element"}. ${benchmarksIncoming} ${benchmarksIncoming > 1 ? "benchmarks" : "benchmark"} left to start`)
	const concatReduce = () => arrayForBenchmark.reduce((acc, cur) => acc + cur, "");
	const concatJoin = () => arrayForBenchmark.join("");
	const concatToString = () => arrayForBenchmark.toString().replace(/[,]+/g, '');
	const concatFor = () => {
		"use strict"
		let baseString = "";

		for (let forIt = 0; forIt < length; forIt++) {
			baseString += arrayForBenchmark[forIt];
		}
		return baseString;
	}
	const concatForConcat = () => {
		"use strict"
		let baseString = "";
		for (let forIt = 0; forIt < length; forIt++) {
			baseString = baseString.concat(arrayForBenchmark[forIt]);
		}
		return baseString;
	}
	const concatRecursive = (baseStr = "", recIt = 0) => {
		return recIt < length ? concatRecursive(baseStr + arrayForBenchmark[recIt], ++recIt) : baseStr
	}
	const concatRecursiveUsingConcat = (baseStr = "", recIt = 0) => {
		return recIt < length ? concatRecursiveUsingConcat(baseStr.concat(arrayForBenchmark[recIt]), ++recIt) : baseStr
	}
	const concatTailRecursive = (baseStr = "", recIt = 0) => {
		return recIt >= length ? baseStr : concatRecursive(baseStr + arrayForBenchmark[recIt], ++recIt);
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
			console.log("\t", length, String(ev.target));
		})
		.on('complete', (ev) => {
			const connect = new sendBenchmarkResultsToApiServer(ev, 'array_size', length);
			connect._send('string_concat');
		})
		.run({async: true});
}

