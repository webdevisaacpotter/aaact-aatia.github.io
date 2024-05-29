document.getElementById('myForm').addEventListener('submit', function (event) {
	event.preventDefault(); // Prevent form submission
	setTimeout(function () {
			// This function will be executed after 0.5 seconds
			var loadingMessage = document.getElementById('loadingMessage');
	loadingMessage.setAttribute('aria-hidden', 'true');
		}, 500);

	});
