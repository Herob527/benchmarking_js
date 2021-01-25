export const oldDebruijn = (alphabet, wordlength) => {
	var k = alphabet.length;
	var n = wordlength;
	if (k <= 0 || n <= 0) return '';
	var a = [];
	for (var i = 0; i < k * n; ++i) a[i] = 0;
	var res = [];
	var db = function (t, p) {
		if (t > n) {
			if (n % p == 0) {
				for (var i = 1; i <= p; ++i)
					res += alphabet[a[i]] + ' ';
			}
		} else {
			a[t] = a[t - p];
			db(t + 1, p);
			for (var j = a[t - p] + 1; j < k; ++j) {
				a[t] = j;
				db(t + 1, t);
			}
		}
	}
	db(1, 1);
	return res;
}