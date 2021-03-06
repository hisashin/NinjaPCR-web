function langRedirect(lang) {
  if(!lang)
    lang = navigator.language || navigator.browserLanguage;
  //window.alert("lang=" + lang);
  var path = window.location.pathname;
  if (path.startsWith('/ja/') || path.startsWith('/en/'))
     path = path.substring(3);
  if (!path.endsWith('.html')) {
    if (!path.endsWith('/')) {
      path += '/';
    }
    path += 'index.html';
  }
  if (lang.indexOf('ja') == 0)
    document.location.href = '/ja' + path;
  else
    document.location.href = '/en' + path;
}
