const axios = require('axios');
const fhirpath = require('fhirpath');
const { Converter } = require('../src/Converter');
const { getCqlFiles, getLibraryFile, getTestResponse } = require('./helper');
const testELM = require('./fixtures/elm/elms.json');

jest.mock('axios');

describe('Converter', () => {
  test('Should be able to convert cql arrary to CqlLibraries object', () => {
    const converter = new Converter('');
    const cqlData = getCqlFiles(`${__dirname}/fixtures/cql`);
    const cqlLibraries = converter.convertArrayToObject(cqlData);
    expect(Object.keys(cqlLibraries).length).toEqual(3);
    expect(Object.keys(cqlLibraries)).toEqual(['lib_0', 'lib_1', 'lib_2']);
    expect(cqlLibraries.lib_0.cql).toEqual(cqlData[0]);
    expect(cqlLibraries.lib_1.cql).toEqual(cqlData[1]);
    expect(cqlLibraries.lib_2.cql).toEqual(cqlData[2]);
  });

  test('Should be able to convert cql to FHIR library', async () => {
    // setup mocked out requests
    const testHeader = 'multipart/form-data;boundary=Boundary_1';
    axios.post.mockImplementation(() =>
      Promise.resolve({ headers: { 'content-type': testHeader }, data: getTestResponse() })
    );

    const id = undefined;
    const converter = new Converter('http://localhost');
    const cqlData = getCqlFiles(`${__dirname}/fixtures/cql`);
    const fhirLibraries = await converter.convert(cqlData, id);

    // only the first converted CQL is returned
    expect(Object.keys(fhirLibraries).length).toEqual(1);

    const key = Object.keys(testELM)[0];
    const elm = testELM[key];
    const lib = fhirLibraries[`${elm.library.identifier.id}_${elm.library.identifier.version}`];
    expect(lib).toBeDefined();
    expect(fhirpath.evaluate(lib, 'Library.id')[0]).toEqual(elm.library.identifier.id);
    expect(fhirpath.evaluate(lib, 'Library.version')[0]).toEqual(elm.library.identifier.version);
    expect(fhirpath.evaluate(lib, 'Library.title')[0]).toEqual(elm.library.identifier.id);
    expect(
      fhirpath.evaluate(lib, "Library.content.where(contentType='text/cql').data")[0]
    ).toBeDefined();
    expect(
      fhirpath.evaluate(lib, "Library.content.where(contentType='application/elm+json').data")[0]
    ).toBeDefined();
  });

  test('Should be able to convert cql to FHIR library with provided id', async () => {
    // setup mocked out requests
    const testHeader = 'multipart/form-data;boundary=Boundary_1';
    axios.post.mockImplementation(() =>
      Promise.resolve({ headers: { 'content-type': testHeader }, data: getTestResponse() })
    );

    const id = "test_id";
    const converter = new Converter('http://localhost');
    const cqlData = getCqlFiles(`${__dirname}/fixtures/cql`);
    const fhirLibraries = await converter.convert(cqlData, id);

    // only the first converted CQL is returned
    expect(Object.keys(fhirLibraries).length).toEqual(1);

    const key = Object.keys(testELM)[0];
    const elm = testELM[key];
    const lib = fhirLibraries[`${elm.library.identifier.id}_${elm.library.identifier.version}`];
    expect(lib).toBeDefined();
    expect(fhirpath.evaluate(lib, 'Library.id')[0]).toEqual(id);
    expect(fhirpath.evaluate(lib, 'Library.version')[0]).toEqual(elm.library.identifier.version);
    expect(fhirpath.evaluate(lib, 'Library.title')[0]).toEqual(elm.library.identifier.id);
    expect(
      fhirpath.evaluate(lib, "Library.content.where(contentType='text/cql').data")[0]
    ).toBeDefined();
    expect(
      fhirpath.evaluate(lib, "Library.content.where(contentType='application/elm+json').data")[0]
    ).toBeDefined();
  })

  test('Should be able to convert cql to FHIR library with provided library to insert cql', async () => {
    // setup mocked out requests
    const testHeader = 'multipart/form-data;boundary=Boundary_1';
    axios.post.mockImplementation(() =>
      Promise.resolve({ headers: { 'content-type': testHeader }, data: getTestResponse() })
    );

    const id = undefined;
    const converter = new Converter('http://localhost');
    const cqlData = getCqlFiles(`${__dirname}/fixtures/cql`);
    const libFileName = "Library-ChlamydiaScreening_Common.json";
    const fhirLibFile = getLibraryFile(`${__dirname}/fixtures/fhir/${libFileName}`);
    const fhirLibrary = JSON.parse(fhirLibFile);
    const lib = await converter.convertWithLib(cqlData, fhirLibFile, id);

    const key = Object.keys(testELM)[0];
    expect(lib).toBeDefined();
    expect(fhirpath.evaluate(lib, 'Library.id')[0]).toEqual(fhirpath.evaluate(fhirLibrary, 'Library.id')[0]);
    expect(fhirpath.evaluate(lib, 'Library.version')[0]).toEqual(fhirpath.evaluate(fhirLibrary, 'Library.version')[0]);
    expect(fhirpath.evaluate(lib, 'Library.title')[0]).toEqual(fhirpath.evaluate(fhirLibrary, 'Library.title')[0]);
    expect(
      fhirpath.evaluate(lib, "Library.content.where(contentType='text/cql').data")[0]
    ).toBeDefined();
    expect(
      fhirpath.evaluate(lib, "Library.content.where(contentType='application/elm+json').data")[0]
    ).toBeDefined();
  });

  test('Should be able to convert cql to FHIR library with provided library to insert cql with provided id', async () => {
    // setup mocked out requests
    const testHeader = 'multipart/form-data;boundary=Boundary_1';
    axios.post.mockImplementation(() =>
      Promise.resolve({ headers: { 'content-type': testHeader }, data: getTestResponse() })
    );

    const id = "test_id";
    const converter = new Converter('http://localhost');
    const cqlData = getCqlFiles(`${__dirname}/fixtures/cql`);
    const libFileName = "Library-ChlamydiaScreening_Common.json";
    const fhirLibFile = getLibraryFile(`${__dirname}/fixtures/fhir/${libFileName}`);
    const fhirLibrary = JSON.parse(fhirLibFile);
    const lib = await converter.convertWithLib(cqlData, fhirLibFile, id);

    const key = Object.keys(testELM)[0];
    expect(lib).toBeDefined();
    expect(fhirpath.evaluate(lib, 'Library.id')[0]).toEqual(id);
    expect(fhirpath.evaluate(lib, 'Library.version')[0]).toEqual(fhirpath.evaluate(fhirLibrary, 'Library.version')[0]);
    expect(fhirpath.evaluate(lib, 'Library.title')[0]).toEqual(fhirpath.evaluate(fhirLibrary, 'Library.title')[0]);
    expect(
      fhirpath.evaluate(lib, "Library.content.where(contentType='text/cql').data")[0]
    ).toBeDefined();
    expect(
      fhirpath.evaluate(lib, "Library.content.where(contentType='application/elm+json').data")[0]
    ).toBeDefined();
  });
});
