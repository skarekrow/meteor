function BabelCompiler() {}

var BCp = BabelCompiler.prototype;

BCp.processFilesForTarget = function (inputFiles) {
  inputFiles.forEach(function (inputFile) {
    var source = inputFile.getContentsAsString();
    var inputFilePath = inputFile.getPathInPackage();
    var outputFilePath = inputFile.getPathInPackage();
    var fileOptions = inputFile.getFileOptions();

    var result = Babel.transformMeteor(source, {
      sourceMap: true,
      filename: inputFilePath,
      sourceFileName: "/" + inputFilePath,
      sourceMapName: "/" + outputFilePath + ".map"
    });

    inputFile.addJavaScript({
      sourcePath: inputFilePath,
      path: outputFilePath,
      data: result.code,
      hash: result.hash,
      sourceMap: result.map,
      bare: !!fileOptions.bare
    });
  });
};

BCp.setDiskCacheDirectory = function (cacheDir) {
  Babel.setCacheDir(cacheDir);
};

Plugin.registerCompiler({
  extensions: ['js'],
}, function () {
  return new BabelCompiler();
});
