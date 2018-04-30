module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);

  var pkgJson = require('./package.json');

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-typescript');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-string-replace');

  grunt.initConfig({
    clean: ['dist'],
    copy: {
      dist_vendor_js: {
        expand: true,
        //cwd: 'node_modules/jquery-ui/external/jquery-1.12.4/',
        cwd: 'vendor/jquery-ui-1.12.4/',
        src: ['**/*.js'],
        dest: 'dist',
      },
      dist_js: {
        expand: true,
        cwd: 'src',
        src: ['**/*.ts', '**/*.d.ts'],
        dest: 'dist',
      },
      dist_html: {
        expand: true,
        flatten: true,
        cwd: 'src/partials',
        src: ['*.html'],
        dest: 'dist/partials/',
      },
      dist_css: {
        expand: true,
        flatten: true,
        cwd: 'src/css',
        src: ['**/*.css'],
        dest: 'dist/css/',
      },
      dist_css_images: {
        expand: true,
        flatten: true,
        cwd: 'src/css/images',
        src: ['**/*.png'],
        dest: 'dist/css/images/',
      },
      dist_img: {
        expand: true,
        flatten: true,
        cwd: 'src/img',
        src: ['*.*'],
        dest: 'dist/img/',
      },
      dist_statics: {
        expand: true,
        flatten: true,
        src: ['src/plugin.json', 'LICENSE', 'README.md'],
        dest: 'dist/',
      },
    },

    typescript: {
      build: {
        src: ['dist/**/*.ts', '!**/*.d.ts'],
        dest: 'dist',
        options: {
          module: 'system',
          target: 'es5',
          rootDir: 'dist/',
          declaration: true,
          emitDecoratorMetadata: true,
          experimentalDecorators: true,
          sourceMap: true,
          noImplicitAny: false,
        },
      },
    },

    'string-replace': {
      dist: {
        files: [
          {
            cwd: 'src',
            expand: true,
            src: ['**/plugin.json'],
            dest: 'dist',
          },
        ],
        options: {
          replacements: [
            {
              pattern: '%VERSION%',
              replacement: pkgJson.version,
            },
            {
              pattern: '%TODAY%',
              replacement: '<%= grunt.template.today("yyyy-mm-dd") %>',
            },
          ],
        },
      },
    },

    watch: {
      files: [
        'src/**/*.ts',
        'src/**/*.html',
        'src/**/*.css',
        'src/img/*.*',
        'src/plugin.json',
        'README.md',
      ],
      tasks: ['default'],
      options: {
        debounceDelay: 250,
      },
    },
  });

  grunt.registerTask('default', [
    'clean',
    'copy:dist_js',
    'copy:dist_vendor_js',
    'typescript:build',
    'copy:dist_html',
    'copy:dist_css',
    'copy:dist_css_images',
    'copy:dist_img',
    'copy:dist_statics',
    'string-replace',
  ]);
};
