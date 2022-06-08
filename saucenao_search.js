#!/usr/bin/env node

const fs = require("fs")
const sn = require("./sn")

const args = process.argv.slice(2)

let url
let file
let result

function printResult(result) {
	for (let i = 0; i < result.length; i++) {
		console.log(`Result ${i + 1}:`)
		console.log(`Similarity: ${result[i].similarity}`)
		console.log(`Title: ${result[i].title}`)
		console.log(`Url: ${result[i].url}`)
		console.log()
	}

	if (result.length === 0) {
		console.log("No results found")
	}
}

function showUsage() {
	console.log("usage: saucenao_search [<url> | -u <url> | -f <file> | -h]")
}

(async() => {
	switch(args.length) {
		case 0:
			console.log("error: no url provided")
			showUsage()
			break
		case 1:
			if (args[0][0] === "-") {
				if (args[0] === "-u") {
					console.log("no url provided")
				} else if (args[0] === "-f") {
					console.log("no file provided")
				} else if (args[0] !== "-h") {
					console.log(`invalid option ${args[0]}`)
				}
				showUsage()
				break
			} else {
				url = args[0]

				result = await (sn.search(url))
				if (result) {
					printResult(sn.parse(result))
				}
				break
			}
		case 2:
			if (args[0] === "-u") {
				url = args[1]

				result = await (sn.search(url))
				if (result) {
					printResult(sn.parse(result))
				}
				break
			} else if (args[0] === "-f") {
				try {
					file = fs.readFileSync(args[1])

					result = await (sn.search(file))
					if (result) {
						printResult(sn.parse(result))
					}
				} catch(error) {
					if (error.code === "ENOENT") {
						console.log(`error: file "${args[1]}" not found`)
					}
				}
				break
			}
		default:
			console.log("too many options")
			showUsage()
			break
	}
})()
