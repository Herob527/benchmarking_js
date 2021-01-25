export const styleDebruijn = (alphabet, wordLength) => {
	alphabet = alphabet.split('');
	const k = alphabet.length;
	const n = wordLength;
	if (!!(k <= 0 || n <= 0))
		return '';
	let a = Array(k * n).fill(0);
	let res = [];
	const db = function (t, p) {
		if (t > n) {
			if (n % p === 0) {
				res = alphabet.reduce((acc, cur) => acc + cur + ' ', '');
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
	db(1, 1)
	return res;
};