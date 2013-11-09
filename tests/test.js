var should = require('should')
var imager = require('../lib/image2pdf')
imager.setup('info')
describe('image2pdf', function() {
  describe('imager.buildTitle()', function() {
    describe('no-date', function() {
      it('Should not print the date', function() {
        var opts = {
          dir: '.',
          title: false,
          date: false
        };
        var title = imager.buildTitle(opts)
        should.exist(title)
        title.should.eql('')
      })
    })
    
    describe('name', function() {
      it('Should print the name', function() {
        var opts = {
          dir: '.',
          name: 'Evan',
          date: false
        };
        var title = imager.buildTitle(opts)
        title.should.eql('<h3><br/><small><strong>Created by:</strong> <code>Evan</code><br/></small></h3><br/><br/>')
      })
    })
    
    describe('title', function() {
      it('Should print title, date, and name', function() {
        var opts = {
          dir: '.',
          title: 'Test',
          name: 'Evan'
        };
        var title = imager.buildTitle(opts)
        title.should.eql('<h3>Test<br/><small><strong>Created by:</strong> <code>Evan</code><br/></small></h3><br/><br/>')
      })
    })
  })
  
  describe('imager.readfiles()', function() {
    describe('pass invalid dir', function() {
      it('Should return an error', function(done) {
        imager.readfiles({}, function(err, files) {
          should.exist(err)
          done()
        })
      })
    })
    
    describe('pass a valid dir', function() {
      it('Should return null, array', function(done) {
        imager.readfiles({dir: '.'}, function(err, files) {
          should.ifError(err)
          files[0].should.be.an.instanceOf(Array)
          files[0].length.should.eql(0)
          done()
        })
      })
    })
  })
})