const data = Array(10000).fill(0).map((_, name) => {
	const startN = Number(new Date()) + (Math.random() * 50 - 35) * 24 * 60 * 60 * 1000
	const startDate = new Date(startN)
	const endDate = new Date(startN + Math.random() * 50 * 24 * 60 * 60 * 1000)
	return ({
		id: `${Math.random()}`.substring(2, 5),
		title: Math.random(),
		parent: name > 0 && Math.random() > 0.8 ? Math.floor(Math.random() * name) : undefined,
		startDate,
		endDate,
		name,
	})
})
export default data;
