export default class SmartObj
{
	constructor(data = {})
	{
		this.data		= Object.assign({}, data || {});
		this.funcsMap	= new Map();
		
		this.proxy = new Proxy(this, {
			has: (target, name) =>
			{
				const info	= this.parseName(name);

				return (info.prop in target.data);
			},
			get: (target, name) =>
			{
				const info	= this.parseName(name);

				const value	= target.data[info.prop];
				
				return value !== undefined ? info.func(value) : value;
			},
			set: (target, name, value) =>
			{
				const info		= this.parseName(name);

				target.data[info.prop]	= info.func(value);

				return true;
			},
			deleteProperty: (target, name) =>
			{
				const info	= this.parseName(name);

				delete target.data[info.prop];

				return true;
			}
		});
		
		return this.proxy;
	}
	
	parseName(name)
	{
		var prop = name,
			func = this.$plain;
		
		if(name.indexOf("__") > -1)
		{
			var parts		= name.split("__");
			const funcName	= parts.shift();
			const detFunc	= this.detectFunction(funcName);

			if(detFunc)
			{
				prop = parts.join("__");
				func = detFunc;
			}
		}
		
		return {
			prop,
			func
		};
	}
	
	detectFunction(funcName)
	{
		return this.funcsMap.get(funcName)
			|| (typeof this[`$${funcName}`] == "function"
			? this[`$${funcName}`] : null);
	}
	
	setFunction(funcName, func)
	{
		this.funcsMap.set(funcName, func);
	}

	$plain(val)
	{
		return val;
	}

	$html(text)
	{
		return text
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#039;");
	}
}