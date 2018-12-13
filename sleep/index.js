const sleep = (time) =>
{
	const startDate = new Date();

	return new Promise((resolve) =>
	{
		setTimeout(() =>
		{
			const endDate	= new Date();
			const timeDiff	= endDate - startDate;

			resolve({
				time,
				timeDiff,
				startDate,
				endDate
			});

		}, time);
	});
};

export default sleep;