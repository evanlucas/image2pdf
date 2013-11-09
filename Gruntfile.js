module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    
    modverify: {
      image2pdf: {
        options: {
          fileFilter: ['bin/image2pdf.js', 'lib/image2pdf.js']
        }
      }
    },
    
    cafemocha: {
      image2pdf: {
        src: 'tests/test.js',
        options: {
          reporter: grunt.option('reporter') || 'spec',
          colors: true,
          ui: 'bdd'
        }
      }
    }
  })
  
  grunt.loadNpmTasks('grunt-modverify')
  grunt.loadNpmTasks('grunt-cafe-mocha')
  
  grunt.registerTask('test', ['cafemocha'])
  grunt.registerTask('default', ['modverify', 'test'])
}