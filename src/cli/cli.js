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
  .option('-o --output <path>', 'Output directory for generated resources', defaultPathToOutput)
  .option('-u --url <url>', 'Specify url to cql-translation-service:', defaultServiceUrl)
  .option('-i --id <id>', 'Specify the id of the output fhir library')
  .option('-l --lib <path>', 'Specify the library to embed the CQL/ELM')
  .option('-d --depends <path>', 'Path to the CQL dependency files.')
  .parse(process.argv);

const {
  file, output, url, id, lib, depends
 } = program;

function getCqlFiles() {
  try {
    fs.lstatSync(file);
  } catch (e) {
    throw new Error(`CQL file(s) ${file} do not exist`);
  }
  // assume single file
  const cqlFiles = [];
  if (fs.lstatSync(file).isDirectory()) {
    // return error
    throw new Error('Specify single CQL file, not a folder');
  } else {
    cqlFiles.push(fs.readFileSync(file));

    if (depends) {
      try {
        fs.lstatSync(depends);
      } catch (e) {
        throw new Error('CQL helper file(s) ${depends} do not exist');
      }
      if (fs.lstatSync(depends).isDirectory()) {
        const files = fs.readdirSync(depends);
        files.forEach(f => {
          const name = `${depends}/${f}`;
          cqlFiles.push(fs.readFileSync(name));
        });
      } else {
        throw new Error('Must specify a helper folder not single file');
      }
    }
  }
  return cqlFiles;
}

function getLibraryFile() {
  try {
    fs.lstatSync(lib);
  } catch (e) {
    throw new Error('Library file ${lib} does not exist');
  }
  return fs.readFileSync(lib, { encoding: 'utf8', flag: 'r' });
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

    if (lib) {
      var libraryFile = getLibraryFile();
      const fhirLibrary = await converter.convertWithLib(cqlFiles, libraryFile, id);

      // strip the folder off of the file path
      const outputFile = path.join(output, path.parse(lib).base);

      // save the file
      logger.info(`Writing resource to  ${outputFile}`);
      fs.writeFileSync(outputFile, JSON.stringify(fhirLibrary, null, 2), 'utf8');
    } else {
      const fhirLibraries = await converter.convert(cqlFiles, id);
      // For each bundle in our extractedData, write it to our output directory
      Object.keys(fhirLibraries).forEach(key => {
        const lib = fhirLibraries[key];
        const outputFile = path.join(output, `Library-${lib.title}.json`);
        logger.info(`Writing resource to  ${outputFile}`);
        fs.writeFileSync(outputFile, JSON.stringify(lib, null, 2), 'utf8');
      });
    }
  } catch (e) {
    logger.error(e.message);
    logger.error(e.stack);
    process.exit(1);
  }
}

runApp();
