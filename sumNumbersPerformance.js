import benchmark from "benchmark"
import { sendBenchmarkResultsToApiServer } from "./sendBenchmarkResultsToApiServer.js";
import { initializeBenchmark } from "./initializeBenchmark.js";

const benchmarkValues = new initializeBenchmark(2 ** 10);

benchmarkValues._map((el, index) => index);

const chunkAmount = 32;
const chunkedArray = benchmarkValues.chunkArray(chunkAmount);


for (let counter = 0; counter < chunkAmount; counter++) {
	const suite = new benchmark.Suite;
	let arrayForBenchmark = [];
	for (let pushIndex = 0; pushIndex <= counter; pushIndex++) {
		arrayForBenchmark.push(chunkedArray[pushIndex]);
	}
	arrayForBenchmark = arrayForBenchmark.flat(Infinity);
	const WASMUInt32Array = new Uint32Array(arrayForBenchmark);
	const length = arrayForBenchmark.length;

	console.log(`\nBenchmarking for ${length} values. ${chunkAmount - counter - 1} benchamrks left`);

	const sumReduce = () => arrayForBenchmark.reduce((acc, cur) => acc + cur, 0);
	const sumWASMReduce = () => WASMUInt32Array.reduce((acc, cur) => acc + cur, 0);
	const sumFor = () => {
		let sum = 0;
		for (let sumIt = 0; sumIt < length; sumIt++) {
			sum += arrayForBenchmark[sumIt];
		}
		return sum;
	}
	const sumWASMFor = () => {
		let sum = 0;
		for (let sumIt = 0; sumIt < length; sumIt++) {
			sum += WASMUInt32Array[sumIt];
		}
		return sum;
	}
	const sumForOf = () => {
		let sum = 0;
		for (let val of arrayForBenchmark) {
			sum += val;
		}
		return sum;
	}
	const sumWASMForOf = () => {
		let sum = 0;
		for (let val of WASMUInt32Array) {
			sum += val;
		}
		return sum;
	}
	const sumRecursive = (acc = 0, cur = arrayForBenchmark[0], index = 0) => {
		if (index >= length) {
			return acc;
		}
		return sumRecursive(acc + cur, arrayForBenchmark[index + 1], ++index);
	}
	const sumWASMRecursive = (acc = 0, cur = WASMUInt32Array[0], index = 0) => {
		if (index >= length) {
			return acc;
		}
		return sumWASMRecursive(acc + cur, WASMUInt32Array[index + 1], ++index);
	}
	suite
		.add('Array sum reduce', sumReduce)
		.add('Array sum for', sumFor)
		.add('Array sum for of', sumForOf)
		.add('Array sum recursive', sumRecursive)
		.add('Uint32 sum reduce', sumWASMReduce)
		.add('Uint32 sum for', sumWASMFor)
		.add('Uint32 sum for of', sumWASMForOf)
		.add('Uint32 sum recursive', sumWASMRecursive)
		.on('cycle', event => console.log(`\t${length}: ${String(event.target)}`))
		.on('complete', (event) => {
			const connect = new sendBenchmarkResultsToApiServer(event, 'array_size', length)
			connect._send("sum_numbers");
		})
		.run({'async': true})
}