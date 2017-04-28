module.exports = (grunt) => {
  require('load-grunt-tasks')(grunt);
  var pkgJson = require('./package.json');

  grunt.loadNpmTasks('grunt-execute');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.initConfig({

    clean: ['dist'],

    copy: {
      src_to_dist: {
        cwd: 'src',
        expand: true,
        src: ['**/*', '!**/*.js', "!**/plugin.json"],
        dest: 'dist'
      },
      pluginDef: {
        expand: true,
        src: ['README.md'],
        dest: 'dist',
      },
    },

    'string-replace': {
      dist: {
        files: [{
          cwd: 'src',
          expand: true,
          src: ["**/plugin.json"],
          dest: 'dist'
        }],
        options: {
          replacements: [{
            pattern: '%VERSION%',
            replacement: pkgJson.version
          },{
            pattern: '%TODAY%',
            replacement: '<%= grunt.template.today("yyyy-mm-dd") %>'
          }]
        }
      }
    },

    watch: {
      rebuild_all: {
        files: ['src/**/*'],
        tasks: ['default'],
        options: {spawn: false}
      },
    },

    babel: {
      options: {
        sourceMap: true,
        presets: ['es2015'],
        plugins: ['transform-es2015-modules-systemjs', 'transform-es2015-for-of'],
      },
      dist: {
        files: [{
          cwd: 'src',
          expand: true,
          src: ['*.js'],
          dest: 'dist',
          ext: '.js'
        }]
      },
    },

  });

  grunt.loadNpmTasks('grunt-gitinfo');
  grunt.loadNpmTasks('grunt-string-replace');
  grunt.registerTask('default', ['clean', 'string-replace', 'copy', 'babel']);
};
