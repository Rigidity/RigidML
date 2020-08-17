$ => timeout => new Promise((resolve, reject) => {
	try {
		setTimeout(() => resolve(timeout[0]), timeout[1]);
	} catch(e) {
		reject(e);
	}
})