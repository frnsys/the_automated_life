const defaultLanguage = 'en';
const availableLanguages = ['en'];
const getPreferredLanguages = () => {
  if (navigator.languages && navigator.languages.length) {
    return navigator.languages;
  } else {
    let lang = navigator.userLanguage || navigator.language || navigator.browserLanguage || defaultLanguage;
    return [lang, defaultLanguage];
  }
}

// Get most preferred language that is supported
const lang = getPreferredLanguages().filter(l => availableLanguages.includes(l))[0];

// Load phrases for language
let phrases = {};
function loadLanguage(cb) {
  fetch(`/static/lang/${lang}.json`)
    .then(response => response.json())
    .then(json => {
      phrases = json;
      cb();
    });
}

function t(key, data) {
  data = data || {};
  let tmpl = phrases[key];
  return Object.keys(data).reduce((acc, k) => {
    return acc.replace(`{${k}}`, data[k]);
  }, tmpl);
}

export { loadLanguage };
export default t;
