import benchmark from "benchmark"
import { sendBenchmarkResultsToApiServer } from "./sendBenchmarkResultsToApiServer.js";
import { initForWasm, initializeBenchmark } from "./initializeBenchmark.js"

const testsAmount = 2048;
/*
* Every tested function must return an incremented array / wasmarray.
* Ex:
* [1,2,3,4,5] -> [1,3,5,7,9].
*
* */

for (let sizeMultiplier = 1; sizeMultiplier <= testsAmount; sizeMultiplier++) {
	const suite = new benchmark.Suite;
	const len = 64 * sizeMultiplier;

	const arrayInit = new initializeBenchmark(len);
	const wasmInit = new initForWasm('u32', len);

	const arrayForBenchmark = arrayInit.baseArray;
	const wasmForBenchmark = wasmInit.wasmArray;
	const incrementingFunction = (el, index) => index;

	arrayInit._map(incrementingFunction);
	wasmInit._map(incrementingFunction);

	console.log(`${sizeMultiplier}. Benchmarking for ${len} values. ${testsAmount - sizeMultiplier} benchmarks left to start`);

	const arrIncrMap = () => arrayForBenchmark.map((el, index) => el + index);
	const arrIncrFor = () => {
		const arr = arrayInit.baseArray;
		for (let index = 0; index < len; index++) {
			arr[index] += index;
		}
		return arr;
	}

	const wasmIncrMap = () => wasmForBenchmark.map((el, index) => el + index);
	const wasmIncrFor = () => {
		const arr = wasmInit.wasmArray;
		for (let index = 0; index < len; index++) {
			arr[index] += index;
		}
		return arr;
	}

	suite
		.add('Array increment by map', arrIncrMap)
		.add('Array increment by for', arrIncrFor)
		.add('Wasm increment by map', wasmIncrMap)
		.add('Wasm increment by for', wasmIncrFor)
		.on('cycle', (event) => {
			// console.log(`\t ${len} ${String(event.target)}`)
			// Resetting values.
			arrayInit._map(incrementingFunction);
			wasmInit._map(incrementingFunction);

		})
		.on('complete', (ev) => {
			const conn = new sendBenchmarkResultsToApiServer(ev, 'array_size', len);
			conn._send('return_incremented_array');
		})
		.run({async: true});
}

