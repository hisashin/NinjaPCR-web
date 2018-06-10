function langRedirect(lang) {
  if(!lang)
    lang = navigator.language || navigator.browserLanguage;
  //window.alert("lang=" + lang);
  var path = window.location.pathname;
  //window.alert("path1=" + path);
  if (path.startsWith('/ja/') || path.startsWith('/en/'))
     path = path.substring(3);
  //window.alert("path2=" + path);
  if (lang.indexOf('ja') == 0)
    document.location.href = '/ja' + path;
  else
    document.location.href = '/en' + path;
}
function isConsole() {
  return /\/console\//.test(window.location.pathname);
}
function isAssy() {
  return /\/assy\//.test(window.location.pathname);
}
function isShop() {
  return /\/shop\//.test(window.location.pathname);
}
function isJa() {
  var lang = navigator.language || navigator.browserLanguage;
  return (lang.startsWith('ja'))
}
function isEn() {
  return (!isJa());
}
