#!/usr/bin/env node
'use strict';

var fs = require('fs');
var fse = require('fs-extra');
var rcopy = require('recursive-copy');
var program = require('commander');
var processor = require('./scripts/processor');

program
    .option('-r, --reverse', 'Perform the reverse process, creating a json structure from a .properties file')
    .option('-m, --merge [file name]', 'Bundles the content of all the generated properties file into one file, prefixed by the name of the file. When used with -r --reverse option, the specified file is unmerged in separate json files represented by the initial key of each group.')
    .option('-s, --spaces <spaces>', 'The amount of spaces per line during the properties to json conversion. Defaults to 4.')
    .option('-c, --config <config>', 'A file in json format having a src and dist attribute, pointing to the source directory where the input files are located, and a destination directory where the output files are written.')
    .parse(process.argv);

var options = {};
if (program.reverse) {
    options.reverse = true;
}

if (program.spaces) {
    options.spaces = +program.spaces;
}

if (program.merge) {
    // If no file name was provided, program.merge has value 'true'
    if (typeof program.merge === 'boolean') {
        var fileName = 'bundle.properties';
        console.log('No file name was provided when using the -m, --merge option. Defaulting to %s...', fileName);
        options.merge = fileName;
    } else {
        options.merge = program.merge;
    }
}

if (program.config) {
    // Read the content of the provided config file as string value
    var fileContent = fs.readFileSync(program.config);
    // Parse the file content into a json structure
    var config = JSON.parse(fileContent);
    // Validate the content of the config
    if (config.src && config.dist) {
        options.config = config;
    } else {
        console.error('Config file invalid. Expecting a JSON object with a src and dist attributes');
    }
} else {
    console.log('Operating in current directory...');
}

options.merge = "messages_en.properties";
options.config= {
    src: "./../signus-service/src/main/webapp/i18n/en",
    dist: "./../signus-service/src/main/resources/i18n"
};
processor.process(options);

options.merge = "messages_ko.properties";
options.config= {
    src: "../signus-service/src/main/webapp/i18n/ko",
    dist: "../signus-service/src/main/resources/i18n"
};
processor.process(options);

const srcDir = "./../signus-service/src/main/resources/i18n";
const destDir = "./../instsign-certificate-issuer/i18n"

fse.emptyDirSync(destDir, function(err){
    if (err) {
        console.error(err);
    } else {
        console.log("success!");
    }
});
// To copy a folder or file
rcopy(srcDir, destDir, function (error, results) {
    if (error) {
        console.error('Copy failed: ' + error);
    } else {
        console.info('Copied ' + results.length + ' files');
    }
});
