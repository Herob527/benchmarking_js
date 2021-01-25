import benchmark from "benchmark"
import { sendBenchmarkResultsToApiServer } from "./sendBenchmarkResultsToApiServer.js";
import { initializeBenchmark } from "./initializeBenchmark.js";

import { perfDebruijn } from "./bench_debrujin/post-refactor-performance-oriented.js";
import { styleDebruijn } from "./bench_debrujin/post-refactor-style-oriented.js";
import { oldDebruijn } from "./bench_debrujin/pre-refactor.js";

const alphabet = 'ABCDE123'.split('');
const length = 5;
for (let index = 1; index <= length; index++) {
	console.log(`${index}. Benchmarks left: ${length - index}`)
	const benchmarkValues = new initializeBenchmark(alphabet.length, {_length: index});
	const suite = new benchmark.Suite;

	benchmarkValues.baseArray = alphabet;
	const chunkedArray = benchmarkValues.chunkArray(alphabet.length)
	const stringiefiedArray = benchmarkValues.stringify(chunkedArray)

	const bPerfDebruijn = () => perfDebruijn(stringiefiedArray, benchmarkValues.additionalValues._length);
	const bStyleDebruijn = () => styleDebruijn(stringiefiedArray, benchmarkValues.additionalValues._length);
	const bOldDebruijn = () => oldDebruijn(stringiefiedArray, benchmarkValues.additionalValues._length)


	suite
		.add('Style oriented', bStyleDebruijn)
		.add('Performance oriented', bPerfDebruijn)
		.add('Old', bOldDebruijn)
		.on('cycle', (event) => console.log(String(event.target)))
		.on('complete', (ev) => {
			const conn = new sendBenchmarkResultsToApiServer(ev, 'subjects', {
				"alphabet": alphabet.toString().replace(/,+/g, ''),
				"length": benchmarkValues.additionalValues._length
			});
			conn._send('de_bruijn_refactor_performance')
		})
		.run({async: true})
}
