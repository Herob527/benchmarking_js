import benchmark from "benchmark"
import { sendBenchmarkResultsToApiServer } from "./sendBenchmarkResultsToApiServer.js";
import { initForWasm, initializeBenchmark } from "./initializeBenchmark.js";

const testsAmount = 32;


for (let sizeMultiplier = 1; sizeMultiplier <= testsAmount; sizeMultiplier++) {
	const suite = new benchmark.Suite;
	const len = 64 * sizeMultiplier;

	const benchmarkStateArray = new initializeBenchmark(len);
	const benchmarkStateWASM = new initForWasm('u32', len);

	const incrementingFunction = (el, index) => index;
	const arrayForBenchmark = benchmarkStateArray.baseArray;
	const wasmForBenchmark = benchmarkStateWASM.baseArray;

	arrayForBenchmark._map(incrementingFunction);
	wasmForBenchmark._map(incrementingFunction);

	console.log(`\nBenchmarking for ${len} values. ${testsAmount - sizeMultiplier} benchmarks left to start`);

	const sumReduce = () => arrayForBenchmark.baseArray.reduce((acc, cur) => acc + cur, 0);
	const sumWASMReduce = () => arrayForBenchmark.baseArray.reduce((acc, cur) => acc + cur, 0);
	const sumFor = () => {
		let sum = 0;
		for (let sumIt = 0; sumIt < len; sumIt++) {
			sum += arrayForBenchmark[sumIt];
		}
		return sum;
	}
	const sumWASMFor = () => {
		let sum = 0;
		for (let sumIt = 0; sumIt < len; sumIt++) {
			sum += wasmForBenchmark[sumIt];
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
		for (let val of wasmForBenchmark) {
			sum += val;
		}
		return sum;
	}
	const sumRecursive = (acc = 0, cur = arrayForBenchmark[0], index = 0) => {
		if (index >= len) {
			return acc;
		}
		return sumRecursive(acc + cur, arrayForBenchmark[index + 1], ++index);
	}
	const sumWASMRecursive = (acc = 0, cur = wasmForBenchmark[0], index = 0) => {
		if (index >= len) {
			return acc;
		}
		return sumWASMRecursive(acc + cur, wasmForBenchmark[index + 1], ++index);
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
		.on('cycle', event => console.log(`\t${len}: ${String(event.target)}`))
		.on('complete', (event) => {
			const connect = new sendBenchmarkResultsToApiServer(event, 'array_size', len)
			connect._send("sum_numbers");
		})
		.run()
}