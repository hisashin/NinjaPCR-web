function getLang () {

  var r = new RegExp('.*\\/([a-z]{2})\\/console\\/.*');
  if (r.test(location.href)) {
    return RegExp.$1;
  }
	if (navigator.languages) {
		return navigator.languages[0];
 	}
	return navigator.language;
}
if (getLang()=='ja') {
	window.MESSAGE = window.MESSAGE_JA;
} else {
	window.MESSAGE = window.MESSAGE_EN;
}
function getLocalizedMessage (messageId) {
	if (window.chrome && chrome.i18n) {
		chrome.i18n.getMessage(messageId);
	} else if (window.MESSAGE) {
		if (window.MESSAGE[messageId] && window.MESSAGE[messageId]["message"]) {
			return window.MESSAGE[messageId]["message"];
		}
		else {
			return messageId;
		}
	} else {
		return messageId;

	}
}
