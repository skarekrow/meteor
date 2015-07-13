function BabelCompiler() {}

var BCp = BabelCompiler.prototype;

BCp.processFilesForTarget = function (inputFiles) {
  inputFiles.forEach(function (inputFile) {
    var source = inputFile.getContentsAsString();
    var inputFilePath = inputFile.getPathInPackage();
    var outputFilePath = inputFile.getPathInPackage();
    var fileOptions = inputFile.getFileOptions();
    var toBeAdded = {
      sourcePath: inputFilePath,
      path: outputFilePath,
      data: source,
      hash: inputFile.getSourceHash(),
      sourceMap: null,
      bare: !! fileOptions.bare
    };

    if (fileOptions.transpile !== false) {
      var result = Babel.transformMeteor(source, {
        sourceMap: true,
        filename: inputFilePath,
        sourceFileName: "/" + inputFilePath,
        sourceMapName: "/" + outputFilePath + ".map"
      });

      toBeAdded.data = result.code;
      toBeAdded.hash = result.hash;
      toBeAdded.sourceMap = result.map;
    }

    inputFile.addJavaScript(toBeAdded);
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
