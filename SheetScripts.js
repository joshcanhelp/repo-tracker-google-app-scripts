/* globals SpreadsheetApp, Browser, CacheService, UrlFetchApp, PropertiesService */

/**
 * Prompt the user for a GitHub API token.
 */
function saveGitHubApiToken() {
  var token = SpreadsheetApp.getUi()
    .prompt("Enter your GitHub API token")
    .getResponseText();
  PropertiesService.getUserProperties().setProperty("GITHUB_API_TOKEN", token);
}

/**
 * Prompt the user for a Codecov API token.
 */
function saveCodecovApiToken() {
  var token = SpreadsheetApp.getUi()
    .prompt("Enter your Codecov API token")
    .getResponseText();
  PropertiesService.getUserProperties().setProperty("CODECOV_API_TOKEN", token);
}

/**
 * Updates selected row with new data.
 */
function updateRow() {
  if (!GitHub.prototype.tokenCheck() || !Codecov.prototype.tokenCheck()) {
    return;
  }

  var sheet = new SheetUtil();

  var dataPoints = sheet.getValues("2:2");
  var currRow = SpreadsheetApp.getActiveRange().getRowIndex();
  var bottomRow = SpreadsheetApp.getActiveRange().getLastRow();

  if (!currRow || !bottomRow) {
    Browser.msgBox("Select at least one cell in a repo row to update.");
    return;
  }

  for (currRow; currRow <= bottomRow; currRow++) {
    if (currRow <= 2) {
      Browser.msgBox("Cannot update header row!");
      return;
    }

    var repoName = sheet.getValue(currRow, 1);
    if (!repoName) {
      Browser.msgBox("Update complete!");
      return;
    }

    // Magic value to start updates on the 3rd column.
    var currCol = 3;

    // Update the release information automatically.
    var useReleaseFeed = true;

    // API call objects.
    var github = new GitHub(repoName);
    var codecov = new Codecov(repoName);

    // All data.
    var allData = {
      comm: github.getCommunity(),
      repo: github.getRepo(),
      release: github.getLatestRelease(),
      traffic: github.getTraffic(),
      ci: github.getCi(),
      coverage: codecov.getCoverage()
    };
    allData.readme = github.getReadmeScore(allData.comm.readme_url);

    dataPoints.forEach(function(el) {
      var doUpdate = true;

      if ("use_release_feed" === el) {
        useReleaseFeed =
          "yes" === sheet.getValue(currRow, currCol).toLowerCase();
        doUpdate = false;
      }

      if (el.indexOf("release|") === 0 && !useReleaseFeed) {
        doUpdate = false;
      }

      if (doUpdate) {
        var dataPoint = el.split("|");
        var value = allData[dataPoint[0]];
        if (typeof dataPoint[1] !== "undefined") {
          value = value[dataPoint[1]];
        }
        sheet.setValue(currRow, currCol, value);
      }

      currCol++;
    });
  }

  Browser.msgBox("Update complete!");
}
