const fs = require('fs');
const path = require('path');
const program = require('commander');
const logger = require('./logger');
const { Converter } = require('../Converter');

const defaultServiceUrl = 'http://localhost:3000';
const defaultPathToOutput = 'output';

program
  .usage('[options]')
  .option('-f --file <path>', 'Path to cql file to translate')
  .option('-o, --output <path>', 'Output directory for generated resources', defaultPathToOutput)
  .option('-u --url <url>', 'Specify url to cql-translation-service:', defaultServiceUrl)
  .parse(process.argv);

const { file, output, url } = program;

function getCqlFiles() {
  try {
    fs.lstatSync(file);
  } catch (e) {
    throw new Error(`CQL file(s) ${file} do not exist`);
  }
  const cqlFiles = [];
  if (fs.lstatSync(file).isDirectory()) {
    const files = fs.readdirSync(file);
    files.forEach((f) => {
      const name = `${file}/${f}`;
      cqlFiles.push(fs.readFileSync(name));
    });
  } else {
    cqlFiles.push(fs.readFileSync(file));
  }
  return cqlFiles;
}

async function runApp() {
  try {
    const cqlFiles = getCqlFiles();
    logger.info(url);
    const converter = new Converter(url);

    // Finally, save the data to disk
    logger.info(`Checking for output directory ${output}`);
    if (!fs.existsSync(output)) {
      logger.info(`Creating output directory ${output}`);
      fs.mkdirSync(output);
    }

    const libraries = await converter.convert(cqlFiles);
    // For each bundle in our extractedData, write it to our output directory
    Object.keys(libraries).forEach((key) => {
      const lib = libraries[key];
      const outputFile = path.join(output, `${lib.title}.json`);
      logger.info(`Writting resource to  ${outputFile}`);
      fs.writeFileSync(outputFile, JSON.stringify(lib), 'utf8');
    });
  } catch (e) {
    logger.error(e.message);
    logger.error(e.stack);
    process.exit(1);
  }
}

runApp();
