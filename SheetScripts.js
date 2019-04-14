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
  // No tokens === no data.
  if (!GitHub.prototype.tokenCheck() || !Codecov.prototype.tokenCheck()) {
    return;
  }

  var currentRowIndex = SpreadsheetApp.getActiveRange().getRowIndex();
  var bottomRowIndex = SpreadsheetApp.getActiveRange().getLastRow();

  // No range selected or some other issue with selected cells.
  if (!currentRowIndex || !bottomRowIndex) {
    Browser.msgBox("Select at least one cell in a repo row to update.");
    return;
  }

  // Can't update rows above 3.
  if (currentRowIndex <= 2) {
    Browser.msgBox("Cannot update header row.");
    return;
  }

  var sheet = new SheetUtil();
  var updateColumns = sheet.getUpdateIndex();

  // Cycle through all rows within the selected range.
  for (currentRowIndex; currentRowIndex <= bottomRowIndex; currentRowIndex++) {
    var repoName = sheet.getValue(currentRowIndex, 1);

    // The range includes empty rows at the bottom so nothing left to update.
    if (!repoName) {
      Browser.msgBox("Update complete!");
      return;
    }

    var github = new GitHub(repoName);
    var codecov = new Codecov(repoName);
    var package = new Package();

    var repoData = {};
    repoData.repo = github.getRepo();
    repoData.comm = github.getCommunity();
    repoData.release = github.getLatestRelease();
    repoData.traffic = github.getTraffic();
    repoData.ci = github.getCi();
    repoData.coverage = codecov.getCoverage();

    Object.keys(updateColumns).forEach(function(currentColumnIndex) {
      var currentCellValue = sheet.getValue(
        currentRowIndex,
        currentColumnIndex
      );
      var columnNameSplit = updateColumns[currentColumnIndex].split("|");
      var columnPrimary = columnNameSplit[0];
      var columnSecondary = columnNameSplit[1];
      
      // Need the value of this column to determine whether to update release data. 
      if ("use_release_feed" === columnPrimary) {
        repoData.use_release_feed = currentCellValue.toUpperCase();
      }

      // Do not update release data if Use Feed is "no".
      if ("release" === columnPrimary && "NO" === repoData.use_release_feed) {
        repoData.release[columnSecondary] = currentCellValue;
      }

      // Update package download stats if there is a package name.
      if ("package_name" === columnPrimary) {
        repoData.package_name = currentCellValue || 'N/A';
        repoData.package_downloads =
          "N/A" === repoData.package_name
            ? "N/A"
            : package.getPackageDownloads(currentCellValue);
      }

      var value = columnSecondary
        ? repoData[columnPrimary][columnSecondary]
        : repoData[columnPrimary];
      sheet.setValue(currentRowIndex, currentColumnIndex, value);
    });
  }

  Browser.msgBox("Update complete!");
}
