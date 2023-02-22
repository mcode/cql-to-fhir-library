## Introduction

This project provides a simple utility to take in CQL files, translate them to ELM and create  corresponding FHIR Libraries that includes both the CQL and the ELM.   

## Dependency
To perform the cql to elm translations this project uses the [cql-translation-service](https://github.com/cqframework/cql-translation-service). Therefore, an instance of this service must be available. Please consult the readme for the cql-translation-service to understand how to build and deploy the service or to run it as a docker container. 


## Usage

The component may be used as a library or via the command line utility that it provides. 

### Library usage

The Converter class has a single constructor parameter being the url to the cql-translation-service to perform the elm translations. Once instantiated it can be used to convert cql to FHIR Library resources by calling the convert method with the desired CQL data. 

Example: 

```
    let cql = "..." 
    let converter = new Converter("http://localhost:3000");  
    let fhirLibraires = converter.convert(cql)
```   


The cql parameter to the convert method may be of one of the following types: 

* String/Buffer of a single CQL document
* Array<String/Buffer> items of multiple CQL documents 
* Object that conforms to the following format
 `{ name: {
    cql: <String/Buffer> cql data
 }}`

### Command line 
```
Usage: cli [options]

Options:
  -f --file <path>     Path to cql file to translate
  -o, --output <path>  Output directory for generated resources (default: "output")
  -u, --url <url>      Specify url to cql-translation-service: (default: "http://localhost:3000")
  -i, --id <id>        Specify the id of the output fhir library (default: cql library name or id of specified library)
  -l, --lib <path>     Specify the library to embed the CQL/ELM
  -d, --depends <path> Path to the CQL dependency files
  -h, --help           display help for command
```

Example usage: 

```   node src/cli/cli.js -f test/fixtures/cql -u http://localhost:8080/cql/translator ```

