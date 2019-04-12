/**
 * GitHub processor constructor.
 *
 * @param repoName string - Repository org/name.
 *
 * @constructor
 */
function GitHub(repoName) {
  this.apiToken = PropertiesService.getUserProperties().getProperty(
    "GITHUB_API_TOKEN"
  );
  this.httpParams = { headers: { Authorization: "token " + this.apiToken } };
  this.repoName = repoName;
  this.apiBaseUrl = "https://api.github.com/repos/" + this.repoName;
}

/**
 * Prompt the user for a GitHub token.
 */
GitHub.prototype.tokenCheck = function() {
  if (
    this.apiToken ||
    PropertiesService.getUserProperties().getProperty("GITHUB_API_TOKEN")
  ) {
    return true;
  }

  Browser.msgBox(
    'Select Tools > Macros > "Save GitHub API token" and enter your GitHub API token.'
  );
  return false;
};

/**
 * Get a single repo.
 * https://developer.github.com/v3/repos/#get
 *
 * @return {object}
 */
GitHub.prototype.getRepo = function() {
  var params = this.httpParams;
  params.headers.Accept = "application/vnd.github.mercy-preview+json";
  var api = new HttpBot(this.apiBaseUrl, params, this.tokenCheck);
  var repoData = api.getAsJson();

  repoData.topics = repoData.private ? "N/A" : repoData.topics.join(", ");
  repoData.pushed_at = repoData.pushed_at.split("T")[0];

  return repoData;
};

/**
 * Get the community profile.
 * https://developer.github.com/v3/repos/community/
 *
 * @return {object}
 */
GitHub.prototype.getCommunity = function() {
  var apiUrl = this.apiBaseUrl + "/community/profile";
  var params = this.httpParams;
  params.headers.Accept = "application/vnd.github.black-panther-preview+json";

  var api = new HttpBot(apiUrl, params, this.tokenCheck);
  var commData = api.getAsJson();

  commData.license = "None";
  if (!commData.files) {
    commData.license = "N/A";
  } else if (commData.files.license && commData.files.license.spdx_id) {
    commData.license = commData.files.license.spdx_id;
  }

  commData.health_percentage = commData.health_percentage || "N/A";
  commData.issue_template =
    commData.files && commData.files.issue_template ? "Yes" : "No";
  commData.pull_request_template =
    commData.files && commData.files.pull_request_template ? "Yes" : "No";
  commData.contributing =
    commData.files && commData.files.contributing ? "Yes" : "No";

  commData.readme = "No";
  commData.readme_url = null;
  if (commData.files && commData.files.readme) {
    commData.readme = "Yes";
    commData.readme_url = commData.files.readme.html_url;
  }

  return commData;
};

/**
 * Get the repo's view count.
 * https://developer.github.com/v3/repos/traffic/#views
 *
 * @return {object}
 */
GitHub.prototype.getTraffic = function(key) {
  var apiUrl = this.apiBaseUrl + "/traffic/views";
  var api = new HttpBot(apiUrl, this.httpParams, this.tokenCheck);
  trafficJson = api.getAsJson();

  ["count", "uniques"].forEach(function(el) {
    trafficJson[el] =
      typeof trafficJson[el] === "undefined"
        ? "No access"
        : parseInt(trafficJson[el], 10);
  });

  return trafficJson;
};

/**
 * Get the latest release from a repo.
 * https://developer.github.com/v3/repos/releases/#get-the-latest-release
 *
 * @return {object}
 */
GitHub.prototype.getLatestRelease = function(key) {
  var apiUrl = this.apiBaseUrl + "/releases/latest";
  var api = new HttpBot(apiUrl, this.httpParams, this.tokenCheck);
  var releaseData = api.getAsJson();

  releaseData.name = releaseData.name || releaseData.tag_name || "None";
  releaseData.published_at =
    (releaseData.published_at && releaseData.published_at.split("T")[0]) ||
    "None";

  return releaseData;
};

/**
 * Check for a Circle or Travis config file.
 *
 * @return {string}
 */
GitHub.prototype.getCi = function() {
  var circleUrl =
    "https://github.com/" + this.repoName + "/tree/master/.circleci/config.yml";
  var circleCheck = new HttpBot(circleUrl);

  if (circleCheck.urlExists()) {
    return "Circle";
  }

  var travisUrl =
    "https://github.com/" + this.repoName + "/tree/master/.travis.yml";
  var travisCheck = new HttpBot(travisUrl);

  if (travisCheck.urlExists()) {
    return "Travis";
  }

  return "None";
};

/**
 * Featch README contents and return a score.
 *
 * @param readme string - README URL.
 *
 * @return {number}
 */
GitHub.prototype.getReadmeScore = function(readmeUrl) {
  if (readmeUrl) {
    readmeUrl = readmeUrl.replace("github.com", "raw.githubusercontent.com");
    readmeUrl = readmeUrl.replace("blob/master", "master");
  } else {
    readmeUrl =
      "https://raw.githubusercontent.com/" +
      this.repoName +
      "/master/README.md";
  }

  var api = new HttpBot(readmeUrl);
  var readme = api.getAsText();

  var sections = [
    "Table of Contents",
    "Documentation",
    "Installation",
    "Getting Started",
    "Contribution",
    "Support + Feedback",
    "Vulnerability Reporting",
    "What is Auth0?",
    "License"
  ];
  var sectionPoints = "#" === readme[0] ? 1 : 0;

  sections.forEach(function(section) {
    sectionPoints += readme.indexOf("## " + section) >= 0 ? 1 : 0;
  });

  return sectionPoints / (sections.length + 1);
};
