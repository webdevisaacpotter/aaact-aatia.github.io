const { DateTime } = require("luxon");
const markdownItAnchor = require("markdown-it-anchor");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const pluginSyntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const { EleventyHtmlBasePlugin } = require("@11ty/eleventy");
const getFileInfo = require("./scripts/filters/fileInfo");
const markdownIt = require("markdown-it");

module.exports = function(eleventyConfig) {
	// Copy the contents of the `public` folder to the output folder
	// For example, `./public/css/` ends up in `_site/css/`
	eleventyConfig.addPassthroughCopy({
		"./public": "/",
		"./admin": "/admin",
	});

	eleventyConfig.addNunjucksAsyncFilter("fileInfo", async (filePaths, callback) => {
		try {
			const fileInfoArray = await getFileInfo(filePaths);
			callback(null, fileInfoArray);
		} catch (error) {
			callback(error, null);
		}
	});

	eleventyConfig.addFilter("postDate", (dateObj) => {
		return DateTime.fromJSDate(dateObj, { zone: "utc" })
			.setLocale("en")
			.toFormat("yyyy'-'MM'-'dd");
	});

	// Run Eleventy when these files change:
	// https://www.11ty.dev/docs/watch-serve/#add-your-own-watch-targets

	// Watch content images for the image pipeline.
	eleventyConfig.addWatchTarget("content/**/*.{svg,webp,png,jpeg}");

	// Official plugins
	eleventyConfig.addPlugin(pluginRss);
	eleventyConfig.addPlugin(pluginSyntaxHighlight, {
		preAttributes: { tabindex: 0 }
	});
	eleventyConfig.addPlugin(EleventyHtmlBasePlugin);

	// Filters
	eleventyConfig.addFilter("readableDate", (dateObj, format, zone) => {
		// Formatting tokens for Luxon: https://moment.github.io/luxon/#/formatting?id=table-of-tokens
		return DateTime.fromJSDate(dateObj, { zone: zone || "utc" }).toFormat(format || "dd LLLL yyyy");
	});

	// Add a filter to format dates in full text with locale
	eleventyConfig.addFilter("fullTextDate", (dateValue, locale = "en") => {
		if (!dateValue) return ""; // Prevent errors if the date is empty

		let parsedDate;

		if (typeof dateValue === "string") {
			// If it's a string, parse it using Luxon
			parsedDate = DateTime.fromFormat(dateValue, "yyyy-MM-dd", { zone: "utc" });
		} else if (dateValue instanceof Date) {
			// If it's already a Date object, convert it to Luxon DateTime
			parsedDate = DateTime.fromJSDate(dateValue, { zone: "utc" });
		} else {
			console.error("Invalid Date Format:", dateValue);
			return "Invalid Date"; // Return a fallback text
		}

		if (!parsedDate.isValid) {
			console.error("Invalid Date:", dateValue);
			return "Invalid Date"; // Prevent Eleventy from breaking
		}

		return parsedDate.setLocale(locale).toFormat("EEEE, d MMMM yyyy");
	});

	eleventyConfig.addFilter('htmlDateString', (dateObj) => {
		// dateObj input: https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
		return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat('yyyy-LL-dd');
	});

	// Get the first `n` elements of a collection.
	eleventyConfig.addFilter("head", (array, n) => {
		if(!Array.isArray(array) || array.length === 0) {
			return [];
		}
		if( n < 0 ) {
			return array.slice(n);
		}

		return array.slice(0, n);
	});

	// Return the smallest number argument
	eleventyConfig.addFilter("min", (...numbers) => {
		return Math.min.apply(null, numbers);
	});

	// Return all the tags used in a collection
	eleventyConfig.addFilter("getAllTags", collection => {
		let tagSet = new Set();
		for(let item of collection) {
			(item.data.tags || []).forEach(tag => tagSet.add(tag));
		}
		return Array.from(tagSet);
	});

	eleventyConfig.addFilter("filterTagList", function filterTagList(tags) {
		return (tags || []).filter(tag => ["all", "nav", "post", "posts"].indexOf(tag) === -1);
	});

	const slugifyFilter = eleventyConfig.javascriptFunctions.slugify;

	eleventyConfig.addFilter("stripTagsSlugify", (str) => {

		if (!str) return;

		return slugifyFilter(stripHtml(str).result, {
		});
	});

	eleventyConfig.addFilter("localeMatch", function (collection) {
		const { locale } = this.ctx; // avoid retrieving it for each item
		return collection.filter((item) => item.data.locale === locale);
	});

	// Customize Markdown library settings:
	eleventyConfig.amendLibrary("md", mdLib => {
		mdLib.use(markdownItAnchor, {
			level: [1,2,3,4],
			slugify: eleventyConfig.getFilter("slugify")
		});
	});

	const markdownItOptions = {
		html: true,  // Allows inline HTML like <abbr>
		breaks: true, // Enables GitHub-style line breaks
		linkify: true, // Auto-links raw URLs
		typographer: true // Enables smart punctuation formatting https://github.com/markdown-it/markdown-it/blob/master/lib/rules_core/replacements.mjs
	};
	const md = markdownIt(markdownItOptions)
	eleventyConfig.setLibrary('md', md);
	eleventyConfig.addFilter('markdownify', (markdownString) =>
		md.renderInline(markdownString)
	);

	eleventyConfig.addShortcode("currentBuildDate", () => {
		return (new Date()).toISOString();
	})

	// Features to make your build faster (when you need them)

	// If your passthrough copy gets heavy and cumbersome, add this line
	// to emulate the file copy on the dev server. Learn more:
	// https://www.11ty.dev/docs/copy/#emulate-passthrough-copy-during-serve

	// eleventyConfig.setServerPassthroughCopyBehavior("passthrough");

	return {
		// Control which files Eleventy will process
		// e.g.: *.md, *.njk, *.html, *.liquid
		templateFormats: [
			"md",
			"njk",
			"html",
			"liquid",
		],

		// Pre-process *.md files with: (default: `liquid`)
		markdownTemplateEngine: "njk",

		// Pre-process *.html files with: (default: `liquid`)
		htmlTemplateEngine: "njk",

		// These are all optional:
		dir: {
			input: "content",          // default: "."
			includes: "../_includes",  // default: "_includes"
			data: "../_data",          // default: "_data"
			output: "_site"
		},

		// -----------------------------------------------------------------
		// Optional items:
		// -----------------------------------------------------------------

		// If your site deploys to a subdirectory, change `pathPrefix`.
		// Read more: https://www.11ty.dev/docs/config/#deploy-to-a-subdirectory-with-a-path-prefix

		// When paired with the HTML <base> plugin https://www.11ty.dev/docs/plugins/html-base/
		// it will transform any absolute URLs in your HTML to include this
		// folder name and does **not** affect where things go in the output folder.
		pathPrefix: "/",
	};
};
