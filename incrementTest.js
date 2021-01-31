import benchmark from "benchmark"
import { sendBenchmarkResultsToApiServer } from "./sendBenchmarkResultsToApiServer.js";
import { initForWasm, initializeBenchmark } from "./initializeBenchmark.js"

const testsAmount = 128;
let testsDone = 0;

for (let sizeMultiplier = 1; sizeMultiplier <= testsAmount; sizeMultiplier++) {
	const suite = new benchmark.Suite;
	const len = Math.floor(8 * sizeMultiplier);

	const benchmarkStateArray = new initializeBenchmark(len);
	const benchmarkStateWASM = new initForWasm('u32', len);

	const incrementingFunction = (el, index) => index;
	const arrayForBenchmark = benchmarkStateArray.baseArray;
	const wasmForBenchmark = benchmarkStateWASM.baseArray;

	benchmarkStateArray._map(incrementingFunction);
	benchmarkStateWASM._map(incrementingFunction);

	console.log(`${sizeMultiplier}. Benchmarking for ${len} values. ${testsAmount - sizeMultiplier} benchmarks left to start`);

	const arrIncrMap = () => arrayForBenchmark.map((el, index) => el + index);
	const arrIncrFor = () => {
		const arr = arrayForBenchmark;
		for (let index = 0; index < len; index++) {
			arr[index] += index;
		}
		return arr;
	}

	const wasmIncrMap = () => wasmForBenchmark.map((el, index) => el + index);
	const wasmIncrFor = () => {
		const arr = wasmForBenchmark;
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
			console.log(`\t ${len} ${String(event.target)}`)
			// Resetting values.
			benchmarkStateArray._map(incrementingFunction);
			benchmarkStateWASM._map(incrementingFunction);

		})
		.on('complete', (ev) => {
			const conn = new sendBenchmarkResultsToApiServer(ev, 'array_size', len);
			console.log(`${++testsDone}\\${testsAmount}`);
			conn._send('return_incremented_array');
		})
		.run({async: true});
}

