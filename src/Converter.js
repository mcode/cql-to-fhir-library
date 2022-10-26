const { Client } = require('cql-translation-service-client');

class Converter {
  constructor(serviceUrl) {
    this.serviceUrl = serviceUrl;
  }

  async convert(cql) {
    const client = new Client(this.serviceUrl);
    const cqlLibraries = this.convertArrayToObject(cql);
    const elms = await client.convertCQL(cqlLibraries);
    const fhirLibraries = this.convertToFHIR(cqlLibraries, elms);
    return fhirLibraries;
  }

  convertToFHIR(cqlLibraries = {}, elms = {}) {
    const fhirLibraries = {};
    Object.keys(cqlLibraries).forEach((key) => {
      const cql = cqlLibraries[key];
      const elm = elms[key];
      fhirLibraries[`${elm.library.identifier.id}_${elm.library.identifier.version}`] = this.libraryTemplate(cql, elm);
    });
    return fhirLibraries;
  }

  // Treat all sumbissions as multiple cql files to make life easier
  convertArrayToObject(_cql) {
    let cql = _cql;
    if (typeof cql === 'string') {
      cql = [cql];
    }
    // if it's an array assume array of string/buffer values
    if (Array.isArray(cql)) {
      const cqlLibraries = {};
      cql.forEach((lib, index) => {
        cqlLibraries[`lib_${index}`] = { cql: lib };
      });
      return cqlLibraries;
    }
    // assume it is already in the CqlLibraries format expected by the translation client
    return cql;
  }

  libraryTemplate(cql, elm) {
    if (!cql || !elm) { return false; }
    // const id = crypto.randomUUID();

    const relatedArtifacts = [{
      type: 'documentation',
      url: 'https://github.com/cqframework/clinical_quality_language/wiki/FHIRHelpers',
      document: {
        url: 'https://github.com/cqframework/clinical_quality_language/wiki/FHIRHelpers',
      },
    },
    {
      type: 'depends-on',
      resource: 'http://hl7.org/fhir/Library/FHIR-ModelInfo',
    },
    ];

    // look at the elm file for includes and pull in the
    // libraries that this one depends on
    if (elm.library.includes && elm.library.includes.def) {
      elm.library.includes.def.forEach((include) => {
        relatedArtifacts.push(
          {
            type: 'depends-on',
            resource: include.path,
          },
        );
      });
    }
    return {
      resourceType: 'Library',
      id: elm.library.identifier.id,
      url: '',
      identifier: [{
        use: 'official',
        value: 'FHIRHelpers',
      }],
      version: elm.library.identifier.version,
      name: elm.library.identifier.id,
      title: elm.library.identifier.id,
      status: 'active',
      experimental: false,
      type: {
        coding: [{
          code: 'logic-library',
        }],
      },
      relatedArtifact: relatedArtifacts,
      content: [{
        contentType: 'text/cql',
        data: Buffer.from(cql.cql).toString('base64'),
      },
      {
        contentType: 'application/elm+json',
        data: Buffer.from(JSON.stringify(elm)).toString('base64'),
      }],
    };
  }
}

module.exports = {
  Converter,
};
