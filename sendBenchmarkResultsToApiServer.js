import axios from "axios";

export class sendBenchmarkResultsToApiServer {
	#eventObjectTarget;
	#dataToSend = {};

	constructor(eventObject, mainLabel, significantValue) {
		this.#eventObjectTarget = eventObject.currentTarget;
		this.#dataToSend["subject"] = {
			"name": mainLabel,
			"value": significantValue
		};
		this.#dataToSend["results"] = {};
	}

	get dataToSend() {
		return this.#dataToSend;
	}

	prepare() {
		const benchedFunctionsAmount = this.#eventObjectTarget.length;
		for (let resultsIndex = 0; resultsIndex < benchedFunctionsAmount; resultsIndex++) {
			const currentResult = this.#eventObjectTarget[resultsIndex];
			const name = currentResult['name'].replace(/\s+/g, "_").toString();
			let preparedData = {};
			preparedData[name] = {'performance': currentResult.hz, 'rme': (currentResult.stats.rme)};
			this.#dataToSend['results'] = {...this.#dataToSend['results'], ...preparedData};
		}
	}

	_send(collection) {
		this.prepare();
		const pr = axios.post(`http://localhost:5001/api/benchmark_results?collection=${collection}`, this.#dataToSend, {
			headers: {
				"Content-Type": "application/json"
			}
		})
			.then(_ => console.log(`${this.#dataToSend["subject"].value}. Data sent successfully.`))
			.catch(err => console.log(err));
		Promise.all(pr).catch((err) => 0);
	}
}

/*
Benchmark results data format to post
subject: {
	name: "name",
	val: "val"
}
results: {
    test1name: {
         performance: 3432423.343
     },
     test2name: {
         performance: 2434453.343
     }
}
*/