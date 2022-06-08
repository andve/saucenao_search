const axios = require("axios")
const cheerio = require("cheerio")
const FormData = require("form-data")

const baseUrl = "https://saucenao.com/search.php"

function parse(result) {
	const $ = cheerio.load(result)
	const parsedResult = [];
	
	$("div[class=result]").each(function (i) {
		if ($(this).text() === "Low similarity results have been hidden. Click here to display them...") {
			return
		} else if ($(this).text() === "No results found... ;_;") {
			return
		}

		const similarity = `${$(this).find($("div[class=resultsimilarityinfo]")).text()}`
		const title = `${$(this).find($("div[class=resulttitle]")).text()}`
		const url = `${$(this).find($("div[class=resultcontentcolumn]")).find($("a")).attr("href")}`

		parsedResult[i] = {
			similarity,
			title,
			url: (url !== "undefined") ? url : "N/A"
		}
	})

	return parsedResult
}

async function search(input) {
	let data
	let response

	const isFile = (typeof(input) === "object") ? true : false

	try {
		if (!isFile) {
			await axios.get(input)
			data = `url=${input}`
		} else {
			data = new FormData()
			data.append("file", input, "image")
		}

		response = await axios.post(
			baseUrl, 
			data,
			{
				headers: {
					"Content-Type": (isFile) ? data.getHeaders()["content-type"] : "application/x-www-form-urlencoded",
				}
			}
		)
	} catch(error) {
		if (error.code === "ERR_BAD_REQUEST") {
			if (error.response.status === 429) {
				console.error("error: daily search limit exceeded")
			} else if (error.response.status === 404) {
				console.error(`error: image no longer exists on the server`)
			} else {
				console.error(`error: returned status ${error.response.status} ${error.response.statusText}`)
			}
		} else if (error.code === "ECONNREFUSED") {
			console.error(`error: invalid url`)
		}
	}

	return (response) ? response.data : undefined
}

module.exports = {
	parse,
	search
}