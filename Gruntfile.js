// Generated on 2013-11-14 using generator-angular-fullstack 0.2.0
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);
  // Imports
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Variables
  var BOWER_DIR = "app/bower_components",
      WEBAPP_DIR = "app/scripts",
      BOOTSTRAP_JS_DIR = BOWER_DIR + "/bootstrap/js/",
      BOOTSTRAP_JS_FILES = [
        BOOTSTRAP_JS_DIR + "bootstrap-transition.js",
        BOOTSTRAP_JS_DIR + "bootstrap-alert.js",
        BOOTSTRAP_JS_DIR + "bootstrap-button.js",
        BOOTSTRAP_JS_DIR + "bootstrap-carousel.js",
        BOOTSTRAP_JS_DIR + "bootstrap-collapse.js",
        BOOTSTRAP_JS_DIR + "bootstrap-dropdown.js",
        BOOTSTRAP_JS_DIR + "bootstrap-modal.js",
        BOOTSTRAP_JS_DIR + "bootstrap-tooltip.js",
        BOOTSTRAP_JS_DIR + "bootstrap-popover.js",
        BOOTSTRAP_JS_DIR + "bootstrap-scrollspy.js",
        BOOTSTRAP_JS_DIR + "bootstrap-tab.js",
        BOOTSTRAP_JS_DIR + "bootstrap-typeahead.js",
        BOOTSTRAP_JS_DIR + "bootstrap-affix.js"
      ],
      INTERNAL_JS_FILES = [
        WEBAPP_DIR + "/**/*.js"
      ],
      EXTERNAL_JS_FILES = [
        BOWER_DIR + "/jquery/dist/jquery.js",
        BOWER_DIR + "/jquery-ui/jquery-ui.js",
        BOWER_DIR + "/angular/angular.js",
        BOWER_DIR + "/bootstrap/dist/js/bootstrap.js",
        BOWER_DIR + "/moment/min/moment.min.js",
        BOWER_DIR + "/angular-resource/angular-resource.js",
        BOWER_DIR + "/angular-cookies/angular-cookies.js",
        BOWER_DIR + "/angular-sanitize/angular-sanitize.js",
        BOWER_DIR + "/angular-route/angular-route.js",
        BOWER_DIR + "/angular-bootstrap/ui-bootstrap-tpls.min.js",
        BOWER_DIR + "/angular-http-auth/src/http-auth-interceptor.js",
        BOWER_DIR + "/angular-ui-calendar/src/calendar.js",
        BOWER_DIR + "/angular-file-upload/angular-file-upload.js",
        BOWER_DIR + "/fullcalendar/dist/fullcalendar.js",
        BOWER_DIR + "/fullcalendar/dist/gcal.js",
        BOWER_DIR + "/toastr/*.js",
        BOWER_DIR + "/underscore/underscore.js",
    ].concat(BOOTSTRAP_JS_FILES),
    EXTERNAL_CSS_FILES = [
      BOWER_DIR + "/bootstrap/dist/css/bootstrap.css",
      BOWER_DIR + "/fullcalendar/dist/fullcalendar.css",
      BOWER_DIR + "/fontawesome/css/font-awesome.css",
      BOWER_DIR + "/toastr/toastr.css"
    ];

  grunt.initConfig({
    yeoman: {
      // configurable paths
      app: require('./bower.json').appPath || 'app',
      dist: 'public',
      views: 'views'
    },
    concat: {
      "app/built/internal.js": INTERNAL_JS_FILES,
      "app/built/external.js": EXTERNAL_JS_FILES,
      "app/built/css/external.css": EXTERNAL_CSS_FILES
    },
    express: {
        options: {
            port: process.env.PORT || 9000
        },
        dev: {
            options: {
                script: 'server.js'
            }
        },
        prod: {
            options: {
                script: 'server.js',
                node_env: 'production'
            }
        }
    },
    open: {
      server: {
        url: 'http://localhost:<%= express.options.port %>'
      }
    },
    watch: {
      coffee: {
        files: ['<%= yeoman.app %>/scripts/{,*/}*.coffee'],
        tasks: ['coffee:dist']
      },
      coffeeTest: {
        files: ['test/spec/{,*/}*.{coffee,js}'],
        tasks: ['coffee:test', 'karma']
      },
      compass: {
        files: ['<%= yeoman.app %>/styles/{,*/}*.{scss,sass}'],
        tasks: ['compass:server', 'autoprefixer']
      },
      express: {
          files: [
              '<%= yeoman.app %>/<%= yeoman.views %>/{,*//*}*.html',
              '{.tmp,<%= yeoman.app %>}/styles/{,*//*}*.css',
              '{.tmp,<%= yeoman.app %>}/scripts/{,*//*}*.js',
              '<%= yeoman.app %>/images/{,*//*}*.{png,jpg,jpeg,gif,webp,svg}',
              'server.js',
              'lib/{,*//*}*.{js,json}'
          ],
          tasks: ['express:dev'],
          options: {
              livereload: true,
              nospawn: true //Without this option specified express won't be reloaded
          }
      },
      styles: {
        files: ['<%= yeoman.app %>/built/css/internal/{,*/}*.css'],
        tasks: ['copy:styles', 'autoprefixer']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      js: {
        files: EXTERNAL_JS_FILES.concat(INTERNAL_JS_FILES),
        tasks: 'concat'
      }
    },
    autoprefixer: {
      options: ['last 1 version'],
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/styles/',
          src: '{,*/}*.css',
          dest: '.tmp/styles/'
        }]
      }
    },
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= yeoman.dist %>/*',
            '<%= yeoman.views %>/*',
            '!<%= yeoman.dist %>/.git*'
          ]
        }]
      },
      heroku: {
        files: [{
          dot: true,
          src: [
            'heroku/*',
            '!heroku/.git*',
            '!heroku/Procfile'
          ]
        }]
      },
      server: '.tmp'
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: [
        'Gruntfile.js',
        '<%= yeoman.app %>/scripts/{,*/}*.js'
      ]
    },
    coffee: {
      options: {
        sourceMap: true,
        sourceRoot: ''
      },
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/scripts',
          src: '{,*/}*.coffee',
          dest: '.tmp/scripts',
          ext: '.js'
        }]
      },
      test: {
        files: [{
          expand: true,
          cwd: 'test/spec',
          src: '{,*/}*.coffee',
          dest: '.tmp/spec',
          ext: '.js'
        }]
      }
    },
    compass: {
      options: {
        sassDir: '<%= yeoman.app %>/styles',
        cssDir: '.tmp/styles',
        generatedImagesDir: '.tmp/images/generated',
        imagesDir: '<%= yeoman.app %>/images',
        javascriptsDir: '<%= yeoman.app %>/scripts',
        fontsDir: '<%= yeoman.app %>/fonts',
        importPath: '<%= yeoman.app %>/bower_components',
        httpImagesPath: '/images',
        httpGeneratedImagesPath: '/images/generated',
        httpFontsPath: '/fonts',
        relativeAssets: false
      },
      dist: {},
      server: {
        options: {
          debugInfo: true
        }
      }
    },
    // not used since Uglify task does concat,
    // but still available if needed
    /*concat: {
      dist: {}
    },*/
    rev: {
      dist: {
        files: {
          src: [
            '<%= yeoman.dist %>/scripts/{,*/}*.js',
            '<%= yeoman.dist %>/styles/{,*/}*.css',
            '<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
            '<%= yeoman.dist %>/styles/fonts/*'
          ]
        }
      }
    },
    useminPrepare: {
      html: '<%= yeoman.app %>/<%= yeoman.views %>/index.html',
      options: {
        dest: '<%= yeoman.dist %>'
      }
    },
    usemin: {
      html: ['<%= yeoman.views %>/{,*/}*.html'],
      css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
      options: {
        assetsDirs: ['<%= yeoman.dist %>']
      }
    },
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/images',
          src: '{,*/}*.{png,jpg,jpeg}',
          dest: '<%= yeoman.dist %>/images'
        }]
      }
    },
    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/images',
          src: '{,*/}*.svg',
          dest: '<%= yeoman.dist %>/images'
        }]
      }
    },
    cssmin: {
      // By default, your `index.html` <!-- Usemin Block --> will take care of
      // minification. This option is pre-configured if you do not wish to use
      // Usemin blocks.
      // dist: {
      //   files: {
      //     '<%= yeoman.dist %>/styles/main.css': [
      //       '.tmp/styles/{,*/}*.css',
      //       '<%= yeoman.app %>/styles/{,*/}*.css'
      //     ]
      //   }
      // }
    },
    htmlmin: {
      dist: {
        options: {
          /*removeCommentsFromCDATA: true,
          // https://github.com/yeoman/grunt-usemin/issues/44
          //collapseWhitespace: true,
          collapseBooleanAttributes: true,
          removeAttributeQuotes: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeOptionalTags: true*/
        },
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/<%= yeoman.views %>',
          src: ['*.html', 'partials/{,*/}*.html'],
          dest: '<%= yeoman.views %>'
        }]
      }
    },
    // Put files not handled in other tasks here
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= yeoman.app %>',
          dest: '<%= yeoman.dist %>',
          src: [
            '*.{ico,png,txt}',
            '.htaccess',
            'bower_components/**/*',
            'images/{,*/}*.{gif,webp}',
            'fonts/*'
          ]
        }, {
          expand: true,
          cwd: '.tmp/images',
          dest: '<%= yeoman.dist %>/images',
          src: [
            'generated/*'
          ]
        }]
      },
      "font-awesome-files": {
        files: [
          {
            cwd: BOWER_DIR + "/fontawesome/fonts/",
            src: ['**'],
            dest: "app/built/fonts/",
            expand: true
          }
        ]
      },
      "bootstrap-font": {
        files: [
          {
            cwd: BOWER_DIR + "/bootstrap/fonts/",
            src: ['**'],
            dest: "app/built/fonts/",
            expand: true
          }
        ]
      },
      heroku: {
        files: [{
          expand: true,
          dot: true,
          dest: 'heroku',
          src: [
            '<%= yeoman.dist %>/**',
            '<%= yeoman.views %>/**'
          ]
        }, {
          expand: true,
          dest: 'heroku',
          src: [
            'package.json',
            'server.js',
            'lib/**/*'
          ]
        }]
      },
      styles: {
        expand: true,
        cwd: '<%= yeoman.app %>/styles',
        dest: '.tmp/styles/',
        src: '{,*/}*.css'
      }
    },
    concurrent: {
      server: [
        'coffee:dist',
        'compass:server',
        'copy:styles'
      ],
      test: [
        'coffee',
        'compass',
        'copy:styles'
      ],
      dist: [
        'coffee',
        'compass:dist',
        'copy:styles',
        'imagemin',
        'svgmin',
        'htmlmin'
      ]
    },
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        singleRun: true
      }
    },
    cdnify: {
      dist: {
        html: ['<%= yeoman.views %>/*.html']
      }
    },
    ngmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/concat/scripts',
          src: '*.js',
          dest: '.tmp/concat/scripts'
        }]
      }
    },
    uglify: {
      dist: {
        files: {
          '<%= yeoman.dist %>/scripts/scripts.js': [
            '<%= yeoman.dist %>/scripts/scripts.js'
          ]
        }
      }
    }
  });

  grunt.registerTask('express-keepalive', 'Keep grunt running', function() {
    this.async();
  });

  grunt.registerTask('compile', ['concat']);

  grunt.registerTask('server', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'express:prod', 'open', 'express-keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'concurrent:server',
      'autoprefixer',
      'express:dev',
      'open',
      'watch'
    ]);
  });

  grunt.registerTask('test', [
    'clean:server',
    'concurrent:test',
    'autoprefixer',
    'karma'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'concat',
    'ngmin',
    'copy:styles',
    'copy:font-awesome-files',
    'copy:bootstrap-font',
    'imagemin',
    'svgmin',
    'htmlmin'
  ]);

  grunt.registerTask('heroku', [
    'build',
    'clean:heroku',
    'copy:heroku'
  ]);

  grunt.registerTask('default', [
    'jshint',
    'test',
    'build'
  ]);
};
