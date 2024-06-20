const fetch = require('node-fetch');

exports.handler = async function (event, context) {
	const params = new URLSearchParams(event.queryStringParameters);
	const code = params.get('code');

	const response = await fetch('https://github.com/login/oauth/access_token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json'
		},
		body: JSON.stringify({
			client_id: process.env.GITHUB_CLIENT_ID,
			client_secret: process.env.GITHUB_CLIENT_SECRET,
			code
		})
	});

	const data = await response.json();
	const accessToken = data.access_token;

	// Fetch user info to check organization membership
	const userResponse = await fetch('https://api.github.com/user', {
		headers: {
			'Authorization': `token ${accessToken}`
		}
	});

	const userData = await userResponse.json();

	const orgResponse = await fetch(`https://api.github.com/orgs/aaact-aatia/members/${userData.login}`, {
		headers: {
			'Authorization': `token ${accessToken}`
		}
	});

	if (orgResponse.status === 204) {
		// User is a member of the organization
		return {
			statusCode: 200,
			body: JSON.stringify(data)
		};
	} else {
		// User is not a member of the organization
		return {
			statusCode: 403,
			body: JSON.stringify({ message: 'You must be a member of the organization to access this site.' })
		};
	}
};
