Package.describe({
  version: '1.0.0',
  // Brief, one-line summary of the package.
  summary: 'Scans HTML files and returns data about top-level tags'
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.2');
  api.use([
    "spacebars-compiler"
  ], "server");
  api.addFiles('html-scanner.js');
  api.export('HtmlScanner');
});

Package.onTest(function (api) {
  api.use('tinytest');
  api.use('htmljs');
  api.use('underscore');
  api.use(['test-helpers', 'session', 'tracker',
           'minimongo'], 'client');
  api.use('spacebars-compiler');
  api.use('minifiers'); // ensure compiler output is beautified

  api.use('html-scanner');

  api.addFiles([
    'html-scanner-tests.js'
  ], 'server');
});
