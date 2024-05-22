---
title: Intake form
description: This intake form is to determine what service you require from AAACT.
---

<form id="myForm">
	<div>
		<p>Instructions: A series of dropdowns will be presented to you one at a time. As you make selections, the form will dynamically update to show you the next relevant set of options. When you activate the "Submit" button, you will be presented with the information that's relevant to your choices</p>
	</div>
	<div class="wb-fieldflow" data-wb-fieldflow='{"noForm": true}' aria-live="polite">
		<p>What do you want to do?</p>
		<ul>
			<li>Go out<div class="wb-fieldflow-sub">
					<p>To do what?</p>><ul>
						<li>Eat<div class="wb-fieldflow-sub">
								<p>Where?</p>
								<ul>
									<li data-wb-fieldflow='{"action": "ajax", "url": "./intake-form/index.html#cafe","container":"#ajaxContainer","type": "replace"}'>Café</li>
									<li data-wb-fieldflow='{"action": "ajax", "url": "./intake-form/index.html#restaurant","container":"#ajaxContainer", "type": "replace"}'>Restaurant</li>
								</ul>
							</div>
						</li>
						<li data-wb-fieldflow='{"action": "ajax", "url": "./intake-form/index.html#shopping","container":"#ajaxContainer","type": "replace"}'>Shopping</li>
						<li>Activity<div class="wb-fieldflow-sub">
								<p>What kind of activity?</p>
								<ul>
									<li>Sports<div class="wb-fieldflow-sub">
											<p>What type of sports?</p>
											<ul>
												<li data-wb-fieldflow='{"action": "ajax", "url": "./intake-form/index.html#gym","container":"#ajaxContainer","type": "replace"}'>Gym</li>
												<li data-wb-fieldflow='{"action": "ajax", "url": "./intake-form/index.html#bicycle","container":"#ajaxContainer", "type": "replace"}'>Bicycle</li>
												<li data-wb-fieldflow='{"action": "ajax", "url": "./intake-form/index.html#swimming","container":"#ajaxContainer", "type": "replace"}'>Swimming</li>
											</ul>
										</div>
									</li>
									<li data-wb-fieldflow='{"action": "ajax", "url": "./intake-form/index.html#picnic","container":"#ajaxContainer", "type": "replace"}'>Picnic</li>
								</ul>
							</div>
						</li>
					</ul>
				</div>
			</li>
			<li>Stay home<div class="wb-fieldflow-sub">
					<p>To do what?</p>><ul>
						<li data-wb-fieldflow='{"action": "ajax", "url": "./intake-form/index.html#read","container":"#ajaxContainer", "type": "replace"}'>Read</li>
						<li>TV<div class="wb-fieldflow-sub">
								<p>What do you want to watch?</p>
								<ul>
									<li data-wb-fieldflow='{"action": "ajax", "url": "./intake-form/index.html#movie","container":"#ajaxContainer", "type": "replace"}'>Movie</li>
									<li data-wb-fieldflow='{"action": "ajax", "url": "./intake-form/index.html#serie","container":"#ajaxContainer", "type": "replace"}'>Serie</li>
								</ul>
							</div>
						</li>
					</ul>
				</div>
			</li>
			<li data-wb-fieldflow='[{"action": "ajax", "url": "./intake-form/index.html#nothing","container":"#ajaxContainer", "type": "replace"}]'>Nothing</li>
		</ul>
	</div><input type="submit" id="submitButton">
</form>
<script>document.getElementById('myForm').addEventListener('submit', function (event) {
		event.preventDefault(); // Prevent form submission
		setTimeout(function () {
			// This function will be executed after 1 seconds
			var loadingMessage = document.getElementById('loadingMessage');
			loadingMessage.setAttribute('aria-hidden', 'true');
		}, 500);

	});</script>
<div id="ajaxContainer" aria-live="polite" style="margin: 15px"></div>
