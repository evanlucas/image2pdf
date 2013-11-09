# image2pdf

Helps make the generation of a PDF of multiple images easier

## Installation

```bash
$ npm install [-g] image2pdf
```

## Usage

If installed locally:

```js
var imager = require('image2pdf')
```

If installed globally:

```bash
Options:

    -h, --help               output usage information
    -V, --version            output the version number
    -v, --verbose            Increase verbosity
    -s, --silly              Increase verbosity even more (takes precedence over verbose)
    -d, --dir <dir>          The directory from which to read the images
    -o, --output <file>      The output pdf
    -q, --quiet              Only log errors (takes precendence over silly and verbose)
    -t, --use-title <title>  Specify the document title
    -d, --no-date            Do not print date created (takes precedence over -D, --date)
    -n, --name <name>        Specify created by
```

## Requirements

node.js >= v0.11.3
phantomjs
`--harmony-generators` flag

## API

  - [imager.buildTitle()](#imagerbuildtitleoptsobject)
  - [imager.readfiles()](#imagerreadfilesoptsobjectcbfunction)
  - [imager.getHead()](#imagergetheadoptsobjectfunctionerrfunction)
  - [imager.createHTML()](#imagercreatehtmloptsobjectcbfunction)
  - [imager.genPDF()](#imagergenpdfinputstringoutputstringcbfunction)
  - [imager.htmlToPDF()](#imagerhtmltopdfhtmlstringfpstringcbfunction)

## imager.buildTitle(opts:Object)

  Builds the title HTML

## imager.readfiles(opts:Object, cb:Function)

  Reads the given _opts.dir_

## imager.getHead(opts:Object, function(err,:Function)

  Generates the HTML head

## imager.createHTML(opts:Object, cb:Function)

  Generates the actual HTML document

## imager.genPDF(input:String, output:String, cb:Function)

  Takes the given _input_ and generates a PDF to _output_

## imager.htmlToPDF(html:String, fp:String, cb:Function)

  Takes the given _html_ string and writes it as a PDF to _fp_