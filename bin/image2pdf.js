#!/usr/bin/env node --harmony-generators
var imager  = require('../lib/image2pdf')
  , program = require('commander')
  , colors  = require('colors')
  , pkg     = require('../package')

process.title = 'image2pdf'

program
  .version(pkg.version)
  .usage('[options]')
  .option('-v, --verbose', 'Increase verbosity')
  .option('-s, --silly', 'Increase verbosity even more')
  .option('-d, --dir <dir>', 'The directory from which to read the images')
  .option('-o, --output <file>', 'The output pdf')
  .option('-q, --quiet', 'Only log errors')
  .option('-t, --use-title <title>', 'Specify the document title')
  .option('-d, --no-date', 'Do not print date created')
  .option('-n, --name <name>', 'Specify created by')
  .parse(process.argv)

var logLevel = 'info'
if (program.verbose) logLevel = 'verbose'
if (program.silly) logLevel = 'silly'
if (program.quiet) logLevel = 'error'

imager.log.level = logLevel

if (!program.dir) {
  imager.log.error('Invalid arguments. -d <dir> is required')
  program.help()
}

var opts = {};
opts.dir = program.dir
opts.date = false
if (program.useTitle) opts.title = program.useTitle
if (program.date) opts.date = true
if (program.name) opts.name = program.name
if (program.output) opts.output = program.output

imager.createHTML(opts, function(err, res) {
  if (err) {
    imager.log.error('Error creating html')
    imager.log.error(err)
    process.exit(1)
  } else {
    if (program.output) {
      imager.htmlToPDF(res, program.output, function(err) {
        if (err) {
          imager.log.error('Error writing pdf to file')
          imager.log.error(err)
          process.exit(1)
        }
        imager.log.info('Successfully wrote pdf to', program.output.grey)
        process.exit()
      })
    } else {
      console.log(res)
    }
  }
})