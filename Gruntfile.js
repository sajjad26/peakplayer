'use strict';
 
module.exports = function(grunt){
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        concat: {
            options: {
                separator: ";"
            },
            dist: {
                src: ["js/*.js"],
                dest: "dist/<%= pkg.name %>.js"
            }
        },
        uglify: {
            options: {
                // the banner is inserted at the top of the output
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
            },
            dist: {
                files: {
                    'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
                }
            }
        },
        less: {
            // production config is also available
            development: {
                files: {
                    // compilation.css  :  source.less
                    "dist/<%= pkg.name %>.css": "less/styles.less"
                }
            },
        },
        watch: {
            files: ["less/*.less", "js/*.js"],
            tasks: ['concat', 'uglify', 'less']
        },
    });
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-less');

    grunt.registerTask('default', ['watch']);
    // grunt.registerTask('default', ['jshint', 'qunit', 'concat', 'uglify']);

}