/**
 * Generic HTTP processor.
 * https://developers.google.com/apps-script/reference/url-fetch/url-fetch-app
 *
 * @constructor
 */
function HttpBot(url, params, preflight) {
  this.url = url;
  this.params = params || {};
  this.preflight = preflight || false;

  this.errorStringPrefix = "HTTPBOT ERROR: ";
}

/**
 * Get the results of a URL fetch as text.
 *
 * @return {string|object}
 */
HttpBot.prototype.getAsText = function() {
  if (this.preflight && !this.preflight()) {
    return this.errorStringPrefix + "Preflight failed";
  }

  try {
    var fetched = UrlFetchApp.fetch(this.url, this.params).getContentText();
  } catch (e) {
    return this.errorStringPrefix + e.toString();
  }

  return fetched;
};

/**
 * Get the results of a URL fetch as an object.
 *
 * @return {object}
 */
HttpBot.prototype.getAsJson = function() {
  var fetched = this.getAsText();

  if (fetched.indexOf(this.errorStringPrefix) === 0) {
    return { error: fetched };
  }

  try {
    return JSON.parse(fetched);
  } catch (e) {
    return { error: "JSON parse error" };
  }
};

/**
 * Returns whether a URL exists or not, based on status code.
 *
 * @return {boolean}
 */
HttpBot.prototype.urlExists = function() {
  var params = this.params;
  params.muteHttpExceptions = true;
  var response = UrlFetchApp.fetch(this.url, params);
  return response.getResponseCode() < 300;
};
