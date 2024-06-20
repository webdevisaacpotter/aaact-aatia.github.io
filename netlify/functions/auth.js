exports.handler = async function (event, context) {
	console.log('Auth function invoked');
	try {
		const { default: fetch } = await import('node-fetch');

		const params = new URLSearchParams(event.queryStringParameters);
		const code = params.get('code');
		console.log('Authorization code:', code);

		if (!code) {
			console.error('Authorization code not found in query parameters');
			return {
				statusCode: 400,
				body: JSON.stringify({ message: 'Authorization code not found' })
			};
		}

		const tokenRequestBody = {
			client_id: process.env.GITHUB_CLIENT_ID,
			client_secret: process.env.GITHUB_CLIENT_SECRET,
			code
		};
		console.log('Token request body:', tokenRequestBody);

		const response = await fetch('https://github.com/login/oauth/access_token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json'
			},
			body: JSON.stringify(tokenRequestBody)
		});

		const data = await response.json();
		console.log('Response from GitHub:', data);

		const accessToken = data.access_token;
		console.log('Access token:', accessToken);

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
		console.log('User data:', userData);

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

		console.log('Organization membership response status:', orgResponse.status);

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
