
const promport = (() =>
{
	// Thanks to David Walsh for his work!
	// https://davidwalsh.name/get-absolute-url

	const getAbsoluteUrl = (() =>
	{
		var $a;
	
		return (url) =>
		{
			if(!$a)
			{
				$a = document.createElement('a');
			}

			$a.href = url;
	
			return $a.href;
		};
	})();


	return (url) =>
	{
		url = getAbsoluteUrl(url);

		// At the first call, initialize the cache objects
		if(!promport.cache)
		{
			promport.cache		= {};
			promport.loading	= {};
			promport.catcher	= {};
		}

		// If the promise of fetch is already present, return a copy
		if(promport.loading[url])
		{
			return promport.loading[url].then();
		}

		// If the result of the import exists in cache, I return a promise directly with the result
		if(promport.cache[url])
		{
			return Promise.resolve(promport.cache[url]);
		}

		// I run the script fetch. Credentials require the same source as the file to be loaded
		const p = fetch(url, {
			method: "GET",
			credentials: "same-origin"
		})
		.then((response) =>
		{
			if(response.ok)
			{
				return response.text();
			}

			throw new Error('Network response was not ok.');
		})
		.then((text) =>
		{
			// I define some random names for the variables to collect and the results
			const loadTemp		= `_exports_${(new Date()).getTime()}_${Math.round(Math.random() * 10000000)}`;
			const loadTempExc	= `${loadTemp}_exc`;
			
			// Encapsulate the loaded external script code into a function that collects the results (of module.exports or any error)
			var code = /*javascript*/`
				try
				{
					promport.catcher["${loadTemp}"] = (function()
					{
						var exports	= {};
						var module	= {exports: exports};
						
						${text}

						return module.exports;
					})();
				}
				catch(e)
				{
					promport.catcher["${loadTempExc}"] = e;
				}
			`;

			// I use a script to execute the contents of the uploaded file, ...
			const	$s = document.createElement('script'),
					$h = document.querySelector('head');
			
			// Esoteric DOM things (for those using jQuery / React)
			$s.setAttribute("type", "text/javascript");
			$s.appendChild(document.createTextNode(code));
			$h.appendChild($s);

			var exc = promport.catcher[loadTempExc],
				ret = promport.catcher[loadTemp];
			
			delete promport.catcher[loadTempExc],
			delete promport.catcher[loadTemp];

			// ... which I then remove from the document
			$h.removeChild($s);
			
			// Delete the loading Promise cache
			delete promport.loading[url];

			if(exc)
			{
				throw Error(`Module "${moduleName}" error: "${exc}"`);
			}

			if(!ret)
			{
				throw Error(`Module "${moduleName}" not loaded`);
			}

			promport.cache[url] = ret;

			return ret;
		});

		// Add the Promise to the loading cache
		promport.loading[url] = p;

		return p;
	};
})();

