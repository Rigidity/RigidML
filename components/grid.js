$ => columns => {
	if (!columns.length) return;
	const items = columns.map(
		item => +item.toString().split("=>")[0].trim().slice(1)
	);
	const total = items.reduce((a, b) => a + b);
	const percents = items.map(item => Math.floor(item / total * 10000) / 100);
	percents[percents.length - 1] += 100.00 - percents.reduce((a, b) => a + b);
	let current = 0.0;
	return percents.map((percent, index) => {
		const actual = current;
		const res = div => [
			(position) => 'absolute',
			(left) => actual + "%",
			(width) => percent + "%",
			(height) => '100%',
			columns[index](div)
		];
		current += percent;
		return res;
	});
},
$ => rows => {
	if (!rows.length) return;
	const items = rows.map(
		item => +item.toString().split("=>")[0].trim().slice(1)
	);
	const total = items.reduce((a, b) => a + b);
	const percents = items.map(item => Math.floor(item / total * 10000) / 100);
	percents[percents.length - 1] += 100.00 - percents.reduce((a, b) => a + b);
	let current = 0.0;
	return percents.map((percent, index) => {
		const actual = current;
		const res = div => [
			(position) => 'absolute',
			(top) => actual + "%",
			(height) => percent + "%",
			(width) => '100%',
			rows[index](div)
		];
		current += percent;
		return res;
	});
}