module.exports = function(grunt) {

    // 1. All configuration goes here 
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        uglify: {
            build: {
                files: {
                    'js/min/script.js': ['js/lib/jquery-2.1.1.js', 'js/lib/snap.js', 'js/lib/underscore.js', 'js/src/script.js']
                }
            }
        },

        sass: {
            dist: {
                options: {
                    compass: true,
                    style: 'compressed'
                },
                files: {
                    'css/style.css': 'scss/style.scss'
                }
            }
        },

        autoprefixer: {
            options: {
                browsers: ['> 1%']
            },
            no_dest: {
                src: 'css/style.css'
            }
        },

        watch: {
            scripts: {
                files: ['js/**/*.js'],
                tasks: ['uglify'],
                options: {
                    spawn: false,
                }
            },
            css: {
                files: ['scss/*.scss', 'css/style.css'],
                tasks: ['sass', 'autoprefixer'],
                options: {
                    spawn: false
                }
            }
        }

    });

    // 3. Where we tell Grunt we plan to use this plug-in.
    
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-autoprefixer');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // 4. Where we tell Grunt what to do when we type "grunt" into the terminal.
    grunt.registerTask('default', ['uglify', 'sass', 'autoprefixer', 'watch']);

};