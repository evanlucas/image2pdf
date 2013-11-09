/**
 * Module dependencies
 */
var fs      = require('fs')
  , path    = require('path')
  , colors  = require('colors')
  , co      = require('co')
  , recess  = require('recess')
  , moment  = require('moment')
  , which   = require('which')
  , spawn   = require('child_process').spawn
  , npmlog  = require('npmlog')
  , imager  = exports

imager.log = npmlog
imager.log.heading = 'image2pdf'


/**
 * Builds the title HTML
 *
 * @param {Object} opts Requires at least `dir`, and `title` keys
 * @api public
 */
imager.buildTitle = function(opts) {
  var title = '<h3>'
    , hasEnd = false
  imager.log.verbose("opts", opts)
  if (opts.title) {
    title += opts.title
  }
  
  if (opts.name) {
    title += '<br/><small><strong>Created by:</strong> <code>'+opts.name+'</code><br/>'
  } else if (opts.title) {
    if (process.env.USER) {
      title += '<br/><small><strong>Created by:</strong> <code>'+process.env.USER+'</code><br/>'
    }
  }
  
  if (opts.date) {
    if (title === '<h3>') title += '<small>'
    title += '<strong>Created on:</strong> <code>'+
      moment().format('MMM Do, YYYY [at] hh:mm A')+
      '</code></small></h3><br/><br/>'
    hasEnd = true
  } else if ((opts.title || opts.name) && !opts.date) {
    hasEnd = true
    title += '</small></h3><br/><br/>'
  }
  
  if (!hasEnd) {
    if (title === '<h3>') {
      title = ''
    } else {
      title += '</small></h3><br/><br/>'
    }
  }
  return title
}

/**
 * Reads the given _opts.dir_
 *
 * @param {Object} opts
 * @param {Function} cb function(err, files, title)
 * @api public
 */
imager.readfiles = function(opts, cb) {
  var dir = opts.dir
    , title = ''
  
  imager.log.verbose('reading files...')
  if (!dir) return cb && cb(new Error('Invalid directory'))
  
  title = imager.buildTitle(opts)
  
  imager.log.verbose("title", title)
  function readdir(dir) {
    return function(cb) {
      fs.readdir(dir, function(err, files) {
        if (err) return cb(err)
        files = files.filter(function(f) {
          return (~imager.imageExts.indexOf(path.extname(f).toLowerCase()))
        })
        return cb(null, files, title)
      })
    }
  }
  
  co(function *() {
    var read = yield readdir(dir)
    //console.log(read)
    return read
  })(cb)
}

/**
 * Generates the HTML head
 *
 * @param {Object} opts 
 * @param {Function} function(err, head)
 * @api public
 */
imager.getHead = function(opts, cb) {
  imager.log.verbose('fetching head...')
  var head = '<!DOCTYPE html>'
  head += '<head>'
  head += '<style>'
  function rec(fp, opt) {
    return function(fn) {
      recess(fp, opt, function(err, data) {
        if (err) return fn(err)
        if (data[0] && data[0].data) {
          head += data[0].data
          head += '</style>'
          head += '</head>'
          return fn(null, head)
        } else {
          return fn(new Error('Invalid result from recess'))
        }
      })
    }
  }
  co(function *() {
    var res = yield rec(path.join(__dirname, 'style.less'), { 
      compile: true 
    })
    return res
  })(cb)
}

/**
 * Generates the actual HTML document
 *
 * @param {Object} opts
 * @param {Function} cb function(err, doc)
 * @api public
 */
imager.createHTML = function(opts, cb) {
  imager.log.verbose('creating html...')
  var title = opts.title || ''
    , dir = opts.dir
  
  function getHead(opts) {
    return function(fn) {
      imager.getHead(opts, fn)
    }
  }
  function readfiles(opts) {
    return function(fn) {
      imager.readfiles(opts, fn)
    }
  }
  
  co(function *() {
    var a = yield readfiles(opts)
    imager.log.verbose('reading files')
    var files = a[0]
    title = a[1]
    var b = yield getHead(opts)
    var head = b
    head += '<body>'
    head += (title) ? title : ''
    head += '<hr>'
    files.forEach(function(file) {
      head += '<img src="'+path.join(dir, file)+'" class="ss"/><hr>'
    })
    head += '</body></html>'
    return head
  })(cb)
}

/**
 * Takes the given _input_ and generates a PDF to _output_
 *
 * @param {String} input The filepath to the html document
 * @param {String} output The filepath to which the PDF will be written
 * @param {Function} cb function(err)
 * @api public
 */
imager.genPDF = function(input, output, cb) {
  which('phantomjs', function(err, phantom) {
    if (err) {
      imager.log.error('Unable to find phantomjs')
      imager.log.error('Is it installed and in your PATH?')
      return cb && cb(err)
    }
    var rasP = path.join(__dirname, 'rasterize.js')
    var child = spawn(phantom, [rasP, input, output, 'Letter'])
    child.stdout.on('data', function(d) {
      imager.log.verbose('stdout:', d.toString())
    })
    child.stderr.on('data', function(d) {
      imager.log.verbose('stderr:', d.toString())
    })
    child.on('exit', function(code) {
      if (code !== 0) {
        return cb && cb(new Error('Phantomjs exited with non-zero'))
      }
      return cb && cb()
    })
  })
}

/**
 * Takes the given _html_ string and writes it as a PDF to _fp_
 *
 * @param {String} html The html content
 * @param {String} fp The output PDF file
 * @param {Function} cb function(err, fp)
 * @api public
 */
imager.htmlToPDF = function(html, fp, cb) {
  function writeFile(fp, content) {
    return function(fn) {
      fs.writeFile(fp, content, 'utf8', fn)
    }
  }
  
  function genPDF(input, output) {
    return function(fn) {
      imager.genPDF(input, output, fn)
    }
  }
  
  function rm(input) {
    return function(fn) {
      fs.unlink(input, fn)
    }
  }
  
  co(function *() {
    var tmpfile = '/tmp/imagepdf_'+moment().format('M_d_YY_h_mm_ss[.html]')
    var writeRes = yield writeFile(tmpfile, html)
    var pdf = yield genPDF(tmpfile, fp)
    yield rm(tmpfile)
    return pdf
  })(cb)
}

imager.imageExts = [
    '.png'
  , '.bmp'
  , '.gif'
  , '.tiff'
  , '.ico'
  , '.jpeg'
  , '.jpg'
]