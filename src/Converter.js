const { Client } = require('cql-translation-service-client');

class Converter {
  constructor(serviceUrl) {
    this.serviceUrl = serviceUrl;
  }

  async convert(cql, id) {
    const client = new Client(this.serviceUrl);
    const cqlLibraries = this.convertArrayToObject(cql);
    const elms = await client.convertCQL(cqlLibraries);

    // error case with too few cqlLibraries
    if (Object.keys(cqlLibraries).length < 1) {
      console.warn("too feww CQL Libraries: " + String(Object.keys(cqlLibraries).length));
      return {};
    }

    const key = Object.keys(cqlLibraries)[0];

    const fhirLibraries = {};
    const elm = elms[key];
    fhirLibraries[`${elm.library.identifier.id}_${elm.library.identifier.version}`] =
      this.libraryTemplate(cqlLibraries[key], elm, id);

    return fhirLibraries;
  }

  async convertWithLib(cql, lib, id) {
    const client = new Client(this.serviceUrl);
    const cqlLibraries = this.convertArrayToObject(cql);
    const elms = await client.convertCQL(cqlLibraries);

    // error case with too few cqlLibraries
    if (Object.keys(cqlLibraries).length < 1) {
      console.warn("too feww CQL Libraries: " + String(Object.keys(cqlLibraries).length));
      return {};
    }

    const key = Object.keys(cqlLibraries)[0];

    // parse the provided FHIR Library
    var fhirLibrary = JSON.parse(lib);

    // update the CQL/ELM in the provided FHIR Library
    return this.updateFHIRLibrary(fhirLibrary, cqlLibraries[key], elms[key], id);
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

  updateFHIRLibrary(library, cql, elm, id) {
    // if an id is supplied, set it
    if (id) {
      library.id = id;
    }

    library.content = [
        {
          contentType: 'text/cql',
          data: Buffer.from(cql.cql).toString('base64')
        },
        {
          contentType: 'application/elm+json',
          data: Buffer.from(JSON.stringify(elm)).toString('base64')
        }
      ];

    return library;
  }

  libraryTemplate(cql, elm, id) {
    if (!cql || !elm) {
      return false;
    }

    // if an id is supplied, set it, otherwise use the cql library id
    var libraryId = id;
    if (!id) {
      libraryId = elm.library.identifier.id;
    }
    // const id = crypto.randomUUID();

    const relatedArtifacts = [
      {
        type: 'documentation',
        url: 'https://github.com/cqframework/clinical_quality_language/wiki/FHIRHelpers',
        document: {
          url: 'https://github.com/cqframework/clinical_quality_language/wiki/FHIRHelpers'
        }
      },
      {
        type: 'depends-on',
        resource: 'http://hl7.org/fhir/Library/FHIR-ModelInfo'
      }
    ];

    // look at the elm file for includes and pull in the
    // libraries that this one depends on
    if (elm.library.includes && elm.library.includes.def) {
      elm.library.includes.def.forEach(include => {
        relatedArtifacts.push({
          type: 'depends-on',
          resource: 'Library/' + include.path
        });
      });
    }
    return {
      resourceType: 'Library',
      id: libraryId,
      url: '',
      //identifier: [
      //  {
      //    use: 'official',
      //    value: 'FHIRHelpers'
      //  }
      //],
      version: elm.library.identifier.version,
      name: elm.library.identifier.id,
      title: elm.library.identifier.id,
      status: 'active',
      experimental: false,
      type: {
        coding: [
          {
            code: 'logic-library'
          }
        ]
      },
      relatedArtifact: relatedArtifacts,
      content: [
        {
          contentType: 'text/cql',
          data: Buffer.from(cql.cql).toString('base64')
        },
        {
          contentType: 'application/elm+json',
          data: Buffer.from(JSON.stringify(elm)).toString('base64')
        }
      ]
    };
  }
}

module.exports = {
  Converter
};
