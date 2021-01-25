export class initializeBenchmark {
	#baseArray;
	#additionalValues;

	constructor(arraySize, additionalValues = {}) {
		this.#baseArray = Array(arraySize).fill(0);
		this.#additionalValues = additionalValues;
	}

	get additionalValues() {
		return this.#additionalValues;
	}

	get baseArray() {
		return this.#baseArray;
	}

	set baseArray(another) {
		return this.#baseArray = another;
	}

	_map(callback) {
		this.#baseArray = this.#baseArray.map(callback);
	}

	chunkArray(chunkAmount) {
		const chunk_size = this.#baseArray.length / chunkAmount;
		const arrayLength = this.#baseArray.length;
		const tempArray = [];
		let myChunk;

		for (let index = 0; index < arrayLength; index += chunk_size) {
			myChunk = this.#baseArray.slice(index, index + chunk_size);
			tempArray.push(myChunk);
		}
		return tempArray;
	}

	stringify(arr, sep = '') {
		return arr.flat(Infinity).toString().replace(/[\s,]+/g, sep);
	}
}

export class initForWasm extends initializeBenchmark {
	#wasmArray;

	constructor(type, arraySize, additionalValues) {
		super(arraySize, additionalValues, additionalValues);
		const typesMap = new Map();

		function getUint8Array() {
			return this.#wasmArray = new Uint8Array(this.baseArray);
		}

		typesMap.set('u8', getUint8Array.call(this));

		function getUint16Array() {
			return this.#wasmArray = new Uint16Array(this.baseArray);
		}

		typesMap.set('u16', getUint16Array.call(this));

		function getUint32Array() {
			return this.#wasmArray = new Uint32Array(this.baseArray);

		}

		typesMap.set('u32', getUint32Array.call(this));

		function getInt8Array() {
			this.#wasmArray = new Int8Array(this.baseArray);
		}

		typesMap.set('i8', getInt8Array.call(this));

		function getInt16Array() {
			return this.#wasmArray = new Int16Array(this.baseArray);
		}

		typesMap.set('i16', getInt16Array.call(this));

		function getInt32Array() {
			return this.#wasmArray = new Int32Array(this.baseArray);
		}

		typesMap.set('i32', getInt32Array.call(this));

		this.#wasmArray = typesMap.get(type);
	}

	get wasmArray() {
		return this.#wasmArray;
	}

	_map(callback) {
		this.#wasmArray = this.#wasmArray.map(callback);
	}
}