/**
 * Codecov processor constructor.
 *
 * @param repoName string - Repo name for coverage.
 *
 * @constructor
 */
function Codecov(repoName) {
  this.apiToken = PropertiesService.getUserProperties().getProperty('CODECOV_API_TOKEN');
  this.httpParams = { headers : { Authorization : 'token ' + this.apiToken } };
  this.repoName = repoName;
  this.apiBaseUrl = 'https://codecov.io/api/gh/' + this.repoName;
}

/**
 * Prompt the user for a Codecov token.
 * 
 * @return {boolean}
 */
Codecov.prototype.tokenCheck = function() {

  if (this.apiToken || PropertiesService.getUserProperties().getProperty('CODECOV_API_TOKEN')) {
    return true;
  }
  
  Browser.msgBox('Select Tools > Macros > "Save Codecov API token" and enter your Codecov API token.');
  return false;
}

/**
 * Get coverage percent of last commit in the master branch.
 *
 * @returns {number}
 */
Codecov.prototype.getCoverage = function () {

  var api = new HttpBot( this.apiBaseUrl, this.httpParams, this.tokenCheck );
  var covData = api.getAsJson();

  coverage = covData.commit && covData.commit.totals && covData.commit.totals.c;
  coverage = coverage || 0;

  return coverage / 100;
};
