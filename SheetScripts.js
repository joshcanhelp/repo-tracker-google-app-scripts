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

function testCommand() {
  Browser.msgBox(SpreadsheetApp.getActiveRange());
  // Browser.msgBox("I told you not to use that ... DELETING ALL SHEETS ... JKJKJK");
}

/**
 * Updates selected row with new data.
 */
function updateRow() {
  if (!GitHub.prototype.tokenCheck() || !Codecov.prototype.tokenCheck()) {
    return;
  }

  var currRow = SpreadsheetApp.getActiveRange().getRowIndex();
  var bottomRow = SpreadsheetApp.getActiveRange().getLastRow();

  if (!currRow || !bottomRow) {
    Browser.msgBox("Select at least one cell in a repo row to update.");
    return;
  }

  if (currRow <= 2) {
    Browser.msgBox("Cannot update header row.");
    return;
  }

  var sheet = new SheetUtil();
  var updateIndex = sheet.getUpdateIndex();

  // Cycle through all rows within the range.
  for (currRow; currRow <= bottomRow; currRow++) {
    var repoName = sheet.getValue(currRow, 1);
    if (!repoName) {
      Browser.msgBox("Update complete!");
      return;
    }

    var github = new GitHub(repoName);
    var codecov = new Codecov(repoName);
    var package = new Package();
    var allData = {};

    allData.repo = github.getRepo();
    allData.comm = github.getCommunity();
    allData.readme = github.getReadmeScore(allData.comm.readme_url);
    allData.release = github.getLatestRelease();
    allData.traffic = github.getTraffic();
    allData.ci = github.getCi();
    allData.coverage = codecov.getCoverage();

    Object.keys(updateIndex).forEach(function(currCol) {
      var currentVal = sheet.getValue(currRow, currCol);
      var colNameParts = updateIndex[currCol].split("|");
      var colType = colNameParts[0];
      var colName = colNameParts[1];

      if ("use_release_feed" === colType) {
        allData.use_release_feed = currentVal.toUpperCase();
      }

      if ("release" === colType && "NO" === allData.use_release_feed) {
        allData.release[colName] = currentVal;
      }

      if ("package_name" === colType) {
        allData.package_name = currentVal;
        allData.package_downloads =
          "N/A" === currentVal
            ? "N/A"
            : package.getPackageDownloads(currentVal);
      }

      var value = colName ? allData[colType][colName] : allData[colType];
      sheet.setValue(currRow, currCol, value);
    });
  }

  Browser.msgBox("Update complete!");
}
