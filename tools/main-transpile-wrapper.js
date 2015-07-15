// This file exists because it is the file in the tool that is not automatically
// transpiled by Babel

require("babel/register");
// Include helpers from NPM so that the compiler doesn't need to add boilerplate
// at the top of every file
require("babel");

// Installs source map support with a hook to add functions to look for source
// maps in custom places
require('./source-map-retriever-stack.js');

// Run the Meteor command line tool
require('./main.js');
