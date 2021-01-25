export const perfDebruijn = (alphabet, wordLength) => {
	const k = alphabet.length;
	const n = wordLength;
	if (!!(k <= 0 || n <= 0))
		return '';
	let a = [];
	for (let i = 0; i < k * n; i++) {
		a.push(0);
	}
	let res = "";
	const db = function (t, p) {
		if (t > n) {
			if (n % p === 0) {
				for (let i = 0; i < p; i++) {
					res += alphabet[a[i]] + ' ';
				}
			}
		} else {
			a[t] = a[t - p];
			db(t + 1, p);
			for (let j = a[t - p] + 1; j < k; ++j) {
				a[t] = j;
				db(t + 1, t);
			}
		}
	}
	db(1, 1);
	return res;
}

