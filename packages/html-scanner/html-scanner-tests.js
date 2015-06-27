Tinytest.add("html-scanner - html scanner in template mode", function (test) {
  var testInString = function(actualStr, wantedContents) {
    if (actualStr.indexOf(wantedContents) >= 0)
      test.ok();
    else
      test.fail("Expected "+JSON.stringify(wantedContents)+
                " in "+JSON.stringify(actualStr));
  };

  var checkError = function(inputString, msgText, lineNum) {
    try {
      HtmlScanner.scan(inputString, "", { templates: true });
    } catch (e) {
      if (e.line === lineNum)
        test.ok();
      else
        test.fail("Error should have been on line " + lineNum + ", not " +
                  e.line);
      testInString(e.message, msgText);
      return;
    }
    test.fail("Parse error didn't throw exception");
  };

  // returns the appropriate code to put content in the body,
  // where content is something simple like the string "Hello"
  // (passed in as a source string including the quotes).
  var simpleBody = function (content) {
    return "\nTemplate.body.addContent((function() {\n  var view = this;\n  return " + content + ";\n}));\nMeteor.startup(Template.body.renderToDocument);\n";
  };

  // arguments are quoted strings like '"hello"'
  var simpleTemplate = function (templateName, content) {
    // '"hello"' into '"Template.hello"'
    var viewName = templateName.slice(0, 1) + 'Template.' + templateName.slice(1);

    return '\nTemplate.__checkName(' + templateName + ');\nTemplate[' + templateName +
      '] = new Template(' + viewName +
      ', (function() {\n  var view = this;\n  return ' + content + ';\n}));\n';
  };

  var checkResults = function(inputString, expectJs, expectHead) {
    var results = HtmlScanner.scan(inputString, "", { templates: true });

    test.equal(results.body, '');
    test.equal(results.js, expectJs || '');
    test.equal(results.head, expectHead || '');
  };

  checkError("asdf", "Expected <template>, <head>, or <body> tag in template file", 1);

  // body all on one line
  checkResults("<body>Hello</body>",
    simpleBody('"Hello"'));

  // multi-line body, contents trimmed
  checkResults("\n\n\n<body>\n\nHello\n\n</body>\n\n\n",
    simpleBody('"Hello"'));

  // same as previous, but with various HTML comments
  checkResults("\n<!--\n\nfoo\n-->\n<!-- -->\n"+
                      "<body>\n\nHello\n\n</body>\n\n<!----\n>\n\n",
    simpleBody('"Hello"'));

  // head and body
  checkResults("<head>\n<title>Hello</title>\n</head>\n\n<body>World</body>\n\n",
    simpleBody('"World"'),
    "<title>Hello</title>");

  // head and body with tag whitespace
  checkResults("<head\n>\n<title>Hello</title>\n</head  >\n\n<body>World</body\n\n>\n\n",
    simpleBody('"World"'),
    "<title>Hello</title>");

  // head, body, and template
  checkResults("<head>\n<title>Hello</title>\n</head>\n\n<body>World</body>\n\n"+
                      '<template name="favoritefood">\n  pizza\n</template>\n',
    simpleBody('"World"') + simpleTemplate('"favoritefood"', '"pizza"'),
    "<title>Hello</title>");

  // one-line template
  checkResults('<template name="favoritefood">pizza</template>',
    simpleTemplate('"favoritefood"', '"pizza"'));

  // template with other attributes
  checkResults('<template foo="bar" name="favoritefood" baz="qux">'+
                      'pizza</template>',
    simpleTemplate('"favoritefood"', '"pizza"'));

  // whitespace around '=' in attributes and at end of tag
  checkResults('<template foo = "bar" name  ="favoritefood" baz= "qux"  >'+
                      'pizza</template\n\n>',
    simpleTemplate('"favoritefood"', '"pizza"'));

  // whitespace around template name
  checkResults('<template name=" favoritefood  ">pizza</template>',
    simpleTemplate('"favoritefood"', '"pizza"'));

  // single quotes around template name
  checkResults('<template name=\'the "cool" template\'>'+
                      'pizza</template>',
    simpleTemplate('"the \\"cool\\" template"', '"pizza"'));

  checkResults('<body foo="bar">\n  Hello\n</body>',
    "\nMeteor.startup(function() { $('body').attr({\"foo\":\"bar\"}); });\n" + simpleBody('"Hello"'));

  // error cases; exact line numbers are not critical, these just reflect
  // the current implementation

  // unclosed body (error mentions body)
  checkError("\n\n<body>\n  Hello\n</body", "body", 3);

  // bad open tag
  checkError("\n\n\n<bodyd>\n  Hello\n</body>", "Expected <template>, <head>, or <body> tag in template file", 4);
  checkError("\n\n\n\n<body foo=>\n  Hello\n</body>", "error in tag", 5);

  // unclosed tag
  checkError("\n<body>Hello", "nclosed", 2);

  // unnamed template
  checkError("\n\n<template>Hi</template>\n\n<template>Hi</template>", "name", 3);

  // helpful doctype message
  checkError('<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" '+
        '"http://www.w3.org/TR/html4/strict.dtd">'+
        '\n\n<head>\n</head>', "DOCTYPE", 1);

  // lowercase basic doctype
  checkError('<!doctype html>', "DOCTYPE", 1);

  // attributes on head not supported
  checkError('<head foo="bar">\n  Hello\n</head>', "<head>", 1);

  // can't mismatch quotes
  checkError('<template name="foo\'>pizza</template>', "error in tag", 1);

  // unexpected <html> at top level
  checkError('\n<html>\n</html>', "Expected <template>, <head>, or <body> tag in template file", 2);

});

Tinytest.add("html-scanner - html scanner in static mode", function (test) {
  var testInString = function(actualStr, wantedContents) {
    if (actualStr.indexOf(wantedContents) >= 0)
      test.ok();
    else
      test.fail("Expected "+JSON.stringify(wantedContents)+
                " in "+JSON.stringify(actualStr));
  };

  var checkError = function(inputString, msgText, lineNum) {
    try {
      HtmlScanner.scan(inputString, "", { templates: false });
    } catch (e) {
      if (e.line === lineNum)
        test.ok();
      else
        test.fail("Error should have been on line " + lineNum + ", not " +
                  e.line);
      testInString(e.message, msgText);
      return;
    }
    test.fail("Parse error didn't throw exception");
  };

  // returns the appropriate code to put content in the body,
  // where content is something simple like the string "Hello"
  // (passed in as a source string including the quotes).
  var simpleBody = function (content) {
    return content;
  };

  // arguments are quoted strings like '"hello"'
  var simpleTemplate = function (templateName, content) {
    // '"hello"' into '"Template.hello"'
    var viewName = templateName.slice(0, 1) + 'Template.' + templateName.slice(1);

    return '\nTemplate.__checkName(' + templateName + ');\nTemplate[' + templateName +
      '] = new Template(' + viewName +
      ', (function() {\n  var view = this;\n  return ' + content + ';\n}));\n';
  };

  var checkResults = function(inputString, expectBody, expectHead, expectJs) {
    var results = HtmlScanner.scan(inputString, "", { templates: false });

    test.equal(results.js, expectJs || '');
    test.equal(results.body, expectBody || '');
    test.equal(results.head, expectHead || '');
  };

  var badTagError = "Expected <head> or <body> tag in HTML file";

  checkError("asdf", badTagError, 1);

  // body all on one line
  checkResults("<body>Hello</body>",
    simpleBody('Hello'));

  // multi-line body, contents trimmed
  checkResults("\n\n\n<body>\n\nHello\n\n</body>\n\n\n",
    simpleBody('Hello'));

  // same as previous, but with various HTML comments
  checkResults("\n<!--\n\nfoo\n-->\n<!-- -->\n"+
                      "<body>\n\nHello\n\n</body>\n\n<!----\n>\n\n",
    simpleBody('Hello'));

  // head and body
  checkResults("<head>\n<title>Hello</title>\n</head>\n\n<body>World</body>\n\n",
    simpleBody('World'),
    "<title>Hello</title>");

  // head and body with tag whitespace
  checkResults("<head\n>\n<title>Hello</title>\n</head  >\n\n<body>World</body\n\n>\n\n",
    simpleBody('World'),
    "<title>Hello</title>");

  // head, body, and template
  checkError("<head>\n<title>Hello</title>\n</head>\n\n<body>World</body>\n\n"+
                      '<template name="favoritefood">\n  pizza\n</template>\n',
    badTagError, 7);

  checkResults('<body foo="bar">\n  Hello\n</body>',
    "Hello",
    "",
    "\nMeteor.startup(function() { $('body').attr({\"foo\":\"bar\"}); });\n");

  // error cases; exact line numbers are not critical, these just reflect
  // the current implementation

  // unclosed body (error mentions body)
  checkError("\n\n<body>\n  Hello\n</body", "body", 3);

  // bad open tag
  checkError("\n\n\n<bodyd>\n  Hello\n</body>", badTagError, 4);
  checkError("\n\n\n\n<body foo=>\n  Hello\n</body>", "error in tag", 5);

  // unclosed tag
  checkError("\n<body>Hello", "nclosed", 2);

  // helpful doctype message
  checkError('<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" '+
        '"http://www.w3.org/TR/html4/strict.dtd">'+
        '\n\n<head>\n</head>', "DOCTYPE", 1);

  // lowercase basic doctype
  checkError('<!doctype html>', "DOCTYPE", 1);

  // attributes on head not supported
  checkError('<head foo="bar">\n  Hello\n</head>', "<head>", 1);

  // can't mismatch quotes
  checkError('<template name="foo\'>pizza</template>', "error in tag", 1);

  // unexpected <html> at top level
  checkError('\n<html>\n</html>', badTagError, 2);

});
