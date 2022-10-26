const fs = require('fs');
const testELM = require('./fixtures/elm/elms.json');

function getCqlFiles(input) {
  const cqlFiles = [];
  if (fs.lstatSync(input).isDirectory()) {
    const files = fs.readdirSync(input);
    files.forEach((f) => {
      const name = `${input}/${f}`;
      cqlFiles.push(fs.readFileSync(name));
    });
  } else {
    cqlFiles.push(fs.readFileSync(input));
  }
  return cqlFiles;
}

function getTestResponse() {
  return `--Boundary_1
content-type: application/elm+json
Content-Disposition: form-data; name="lib_0"
${JSON.stringify(testELM.lib_0)}
--Boundary_1
content-type: application/elm+json
Content-Disposition: form-data; name="lib_1"
${JSON.stringify(testELM.lib_1)}
--Boundary_1--
content-type: application/elm+json
Content-Disposition: form-data; name="lib_2"
${JSON.stringify(testELM.lib_2)}
--Boundary_1--`;
}

module.exports = {
  getCqlFiles, getTestResponse,
};
