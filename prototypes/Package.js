/**
 * Package processor constructor.
 *
 * @param site string - Package site.
 * @param name string - Package name.
 *
 * @constructor
 */
function Package() {}

Package.prototype.getPackageDownloads = function(packageString) {
  var packageParts = packageString.split(':');
  var packageSite = packageParts[0];
  var packageName = packageParts[1];

  var packageUrl = this[packageSite + 'Url'](packageName);
  var packageStats = this[packageSite + 'Stats'](packageName);
  packageStats = parseInt(packageStats, 10);

  var packageStatsText = packageStats ? 'CONCATENATE(TEXT(' + packageStats + ', "#,###"), " [View]")' : '"[View]"';
  return '=HYPERLINK("' + packageUrl + '",' + packageStatsText + ')';
}

Package.prototype.npmUrl = function(name) {
  return 'https://www.npmjs.com/package/' + name;
}

Package.prototype.npmStats = function(name) {
  var apiUrl = 'https://api.npmjs.org/downloads/point/last-month/' + name;
  var api = new HttpBot(apiUrl);
  var statsData = api.getAsJson();
  return statsData.downloads;
}

Package.prototype.packagistUrl = function(name) {
  return 'https://packagist.org/packages/' + name;
}

Package.prototype.packagistStats = function(name) {
  var apiUrl = 'https://packagist.org/packages/' + name + '.json';
  var api = new HttpBot(apiUrl);
  var statsData = api.getAsJson();
  return statsData.package.downloads.monthly;
}

Package.prototype.pypiUrl = function(name) {
  return 'https://pypi.org/project/' + name;
}

Package.prototype.pypiStats = function(name) {
  var apiUrl = 'https://pypistats.org/api/packages/' + name + '/recent';
  var api = new HttpBot(apiUrl);
  var statsData = api.getAsJson();
  return statsData.data.last_month;
}

Package.prototype.cocoadocsUrl = function(name) {
  return 'http://cocoadocs.org/docsets/' + name;
}

Package.prototype.cocoadocsStats = function(name) {
  var apiUrl = 'http://metrics.cocoapods.org/api/v1/pods/' + name + '.json';
  var api = new HttpBot(apiUrl);
  var statsData = api.getAsJson();
  return statsData.stats.download_month;
}

Package.prototype.nugetUrl = function(name) {
  return 'https://www.nuget.org/packages/' + name;
}

Package.prototype.nugetStats = function(name) {
  var apiUrl = 'https://api-v2v3search-0.nuget.org/query?q=packageid:' + name;
  var api = new HttpBot(apiUrl);
  var statsData = api.getAsJson();
  return statsData.data[0].versions.slice(-1)[0].downloads;
}

Package.prototype.rubygemsUrl = function(name) {
  return 'https://rubygems.org/gems/' + name;
}

Package.prototype.rubygemsStats = function(name) {
  var apiUrl = 'https://rubygems.org/api/v1/gems/' + name + '.json';
  var api = new HttpBot(apiUrl);
  var statsData = api.getAsJson();
  return statsData.version_downloads;
}

Package.prototype.wordpressUrl = function(name) {
  return 'https://wordpress.org/plugins/' + name;
}

Package.prototype.wordpressStats = function(name) {
  var apiUrl = 'https://api.wordpress.org/stats/plugin/1.0/downloads.php?limit=30&slug=' + name;
  var api = new HttpBot(apiUrl);
  var statsData = api.getAsJson();

  var downloads = 0;
  Object.keys(statsData).forEach(function(el) {
    downloads += parseInt( statsData[el], 10 );
  });

  return downloads;
}