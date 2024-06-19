const fs = require("fs-extra");
const path = require("path");
const { DateTime } = require("luxon");
const yauzl = require("yauzl");

async function getFileInfo(filePaths) {
	if (!filePaths || !Array.isArray(filePaths)) {
		console.log("File paths are undefined or not an array.");
		return [];
	}

	const fileInfoArray = await Promise.all(filePaths.map(async (filePath) => {
		try {
			// Prepend 'public' to the file path
			const modifiedPath = path.join("public", filePath);
			const absolutePath = path.join(__dirname, "../../", modifiedPath);
			const stats = fs.statSync(absolutePath);

			// Convert size from bytes to KB and MB
			const sizeInKB = stats.size / 1024;
			const sizeInMB = sizeInKB / 1024;

			// Determine the display size
			let displaySize;
			let displayUnit;
			if (sizeInMB >= 1) {
				displaySize = sizeInMB.toFixed(2);
				displayUnit = 'MB';
			} else {
				displaySize = sizeInKB.toFixed(2);
				displayUnit = 'KB';
			}

			// Format dates
			const modifiedDate = DateTime.fromJSDate(stats.mtime).toFormat("yyyy-MM-dd");
			const createdDate = DateTime.fromJSDate(stats.ctime).toFormat("yyyy-MM-dd");

			// Get document title from docProps/core.xml
			let title = "No Title";
			if (filePath.endsWith(".docx")) {
				const titlePromise = new Promise((resolve, reject) => {
					yauzl.open(absolutePath, { lazyEntries: true }, (err, zipfile) => {
						if (err) return reject(err);

						zipfile.readEntry();
						zipfile.on("entry", (entry) => {
							if (entry.fileName === "docProps/core.xml") {
								zipfile.openReadStream(entry, (err, readStream) => {
									if (err) return reject(err);

									let data = "";
									readStream.on("data", (chunk) => {
										data += chunk;
									});

									readStream.on("end", () => {
										const match = data.match(/<dc:title>([^<]+)<\/dc:title>/);
										if (match && match[1]) {
											resolve(match[1]);
										} else {
											resolve("No Title");
										}
									});
								});
							} else {
								zipfile.readEntry();
							}
						});

						zipfile.on("end", () => {
							resolve("No Title");
						});
					});
				});

				title = await titlePromise;
			}

			return {
				path: filePath, // Include the original file path
				size: stats.size,
				displaySize: displaySize,
				displayUnit: displayUnit,
				modified: modifiedDate,
				created: createdDate,
				title: title,
			};
		} catch (error) {
			console.error(`Error reading file info for ${filePath}:`, error);
			return null;
		}
	}));

	return fileInfoArray.filter(info => info !== null); // Remove null entries
}

module.exports = getFileInfo;
