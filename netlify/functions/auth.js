const fetch = require('node-fetch');

exports.handler = async function (event, context) {
	try {
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

		if (!accessToken) {
			console.error('No access token received:', data);
			return {
				statusCode: 400,
				body: JSON.stringify({ message: 'Authentication failed', error: data })
			};
		}

		// Fetch user info to check organization membership
		const userResponse = await fetch('https://api.github.com/user', {
			headers: {
				'Authorization': `token ${accessToken}`
			}
		});

		const userData = await userResponse.json();

		if (!userData.login) {
			console.error('Failed to fetch user data:', userData);
			return {
				statusCode: 400,
				body: JSON.stringify({ message: 'Failed to fetch user data', error: userData })
			};
		}

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
			console.error('User is not a member of the organization:', userData.login);
			return {
				statusCode: 403,
				body: JSON.stringify({ message: 'You must be a member of the organization to access this site.' })
			};
		}
	} catch (error) {
		console.error('Error in authentication function:', error);
		return {
			statusCode: 500,
			body: JSON.stringify({ message: 'Internal Server Error', error: error.message })
		};
	}
};
