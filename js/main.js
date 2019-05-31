var client = new XMLHttpRequest();
client.open('GET', document.URL);
client.setRequestHeader('Content-type', 'text/plain; charset=UTF-8');
client.onloadend = function() {
	const getURL = (typeof browser === 'undefined') ? chrome.extension.getURL : browser.extension.getURL;

	document.body.textContent = '';

	// Style the page and code highlights.
	const gitlabStyle = document.createElement('link');
	gitlabStyle.rel = 'stylesheet';
	gitlabStyle.type = 'text/css';
	gitlabStyle.href = getURL('css/gitlab.css');
	document.head.appendChild(gitlabStyle);

	const prismStyle = document.createElement('link');
	prismStyle.rel = 'stylesheet';
	prismStyle.type = 'text/css';
	prismStyle.href = getURL('css/prism.css');
	document.head.appendChild(prismStyle);

	const mathStyle = document.createElement('link');
	mathStyle.rel = 'stylesheet';
	mathStyle.type = 'text/css';
	mathStyle.href = getURL('css/katex.css');
	document.head.appendChild(mathStyle);

	// This is considered a good practice for mobiles.
	var viewport = document.createElement('meta');
	viewport.name = 'viewport';
	viewport.content = 'width=device-width, initial-scale=1';
	document.head.appendChild(viewport);

	// Insert html for the markdown into an element for processing.
	var markdownRoot = document.createElement('div');
	markdownRoot.className = "wiki";
	markdownRoot.innerHTML = markdownit({
		html: true,
		linkify: true,
		highlight: function (str, lang) {
			if (!Prism.languages[lang]) return '';
			return Prism.highlight(str, Prism.languages[lang]);
		}
	}).use(texmath.use(katex), {delimiters: 'gitlab'})
	  .use(markdownitHTML5Embed, { html5embed: { useImageSyntax: true } })
	  .render(client.responseText);

	// Trample out script elements.
	markdownRoot.querySelectorAll('script').forEach(each => {
		each.innerText = '';
		each.src = '';
	});

	// Remove hrefs that don't look like URLs.
	const likeUrl = /^[-a-z]*:\/\//i;
	markdownRoot.querySelectorAll('[href]').forEach(each => {
		if (!likeUrl.test(each.href)) {
			each.href = '';
		}
	});

	// Remove event handlers. (Others?)
	var events = ['onclick', 'onload', 'onmouseover', 'onmouseout'];
	var eventsJoined = '[' + events.join('],[') + ']';
	markdownRoot.querySelectorAll(eventsJoined).forEach(each => {
		events.forEach(attr => {
			if (each.getAttribute(attr)) { each.setAttribute(attr, null); }
		});
	});

	// Set the page title.
	var title = markdownRoot.querySelector('h1, h2, h3, h4, h5, h6');		// First header
	if (title) {
		title = title.textContent.trim();
	} else {
		title = markdownRoot.textContent.trim().split("\n", 1)[0].trim();	// First line
	}
	if (title.length > 50) {
		title = title.substr(0, 50) + "...";
	}
	document.title = title;

	// Finally insert the markdown.
	document.body.appendChild(markdownRoot);

	// Jump to anchor
	if (location.hash) {
		setTimeout(function () {
			if (typeof browser !== "undefined") {  // Firefox
				window.location.hash = location.hash;
			} else {  // Chrome
				window.location.href = location.hash;
			}
		}, 0);
	}
}
client.send();
