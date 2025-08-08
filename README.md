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

# Data Rights

<div style="text-align:center">
<b>NOTICE</b>
</div>

This (software/technical data) was produced for the U. S. Government under Contract Number 75FCMC18D0047/75FCMC23D0004, and is subject to Federal Acquisition Regulation Clause 52.227-14, Rights in Data-General.


No other use other than that granted to the U. S. Government, or to those acting on behalf of the U. S. Government under that Clause is authorized without the express written permission of The MITRE Corporation.


For further information, please contact The MITRE Corporation, Contracts Management Office, 7515 Colshire Drive, McLean, VA 22102-7539, (703) 983-6000.

<div style="text-align:center">
<b>&copy;2025 The MITRE Corporation.</b>
</div>

<br />

Licensed under the Apache License, Version 2.0 (the "License"); use of this repository is permitted in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
