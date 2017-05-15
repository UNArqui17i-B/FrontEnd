'use strict';

const BACK_PORT = process.env.BACK_PORT || '5000';
const BACK_URL = process.env.BACK_URL || 'localhost';

const del = require('del');
const gulp = require('gulp');
const gulpif = require('gulp-if');
const mergeStream = require('merge-stream');
const polymerBuild = require('polymer-build');

// Here we add tools that will be used to process our source files.
const imagemin = require('gulp-imagemin');

// Additional plugins can be used to optimize your source files after splitting.
const uglify = require('gulp-uglify');
const cssSlam = require('css-slam').gulp;
const htmlMinifier = require('gulp-html-minifier');

const polymerJson = require('./polymer.json');
const polymerProject = new polymerBuild.PolymerProject(polymerJson);
const buildDirectory = 'build';

/**
 * Waits for the given ReadableStream
 */
function waitFor(stream) {
    return new Promise((resolve, reject) => {
        stream.on('end', resolve);
        stream.on('error', reject);
    });
}

function build() {
    return new Promise((resolve, reject) => { // eslint-disable-line no-unused-vars

        // Lets create some inline code splitters in case you need them later in your build.
        let sourcesStreamSplitter = new polymerBuild.HtmlSplitter();
        let dependenciesStreamSplitter = new polymerBuild.HtmlSplitter();

        // Okay, so first thing we do is clear the build directory
        console.log(`Deleting ${buildDirectory} directory...`);
        del([buildDirectory])
            .then(() => {

                // Let's start by getting your source files. These are all the files
                // in your `src/` directory, or those that match your polymer.json
                // "sources"  property if you provided one.
                let sourcesStream = polymerProject.sources()

                    // If you want to optimize, minify, compile, or otherwise process
                    // any of your source code for production, you can do so here before
                    // merging your sources and dependencies together.
                    .pipe(gulpif(/\.(png|gif|jpg|svg)$/, imagemin()))

                    // The `sourcesStreamSplitter` created above can be added here to
                    // pull any inline styles and scripts out of their HTML files and
                    // into seperate CSS and JS files in the build stream. Just be sure
                    // to rejoin those files with the `.rejoin()` method when you're done.
                    .pipe(sourcesStreamSplitter.split())

                    // Uncomment these lines to add a few more example optimizations to your
                    // source files, but these are not included by default. For installation, see
                    // the require statements at the beginning.
                    .pipe(gulpif(/\.js$/, uglify())) // Install gulp-uglify to use
                    .pipe(gulpif(/\.css$/, cssSlam())) // Install css-slam to use
                    .pipe(gulpif(/\.html$/, htmlMinifier())) // Install gulp-html-minifier to use

                    // Remember, you need to rejoin any split inline code when you're done.
                    .pipe(sourcesStreamSplitter.rejoin());


                // Similarly, you can get your dependencies separately and perform
                // any dependency-only optimizations here as well.
                let dependenciesStream = polymerProject.dependencies();

                // Okay, now let's merge your sources & dependencies together into a single build stream.
                let buildStream = mergeStream(sourcesStream, dependenciesStream)
                    .once('data', () => {
                        console.log('Analyzing build dependencies...');
                    });

                // If you want bundling, pass the stream to polymerProject.bundler.
                // This will bundle dependencies into your fragments so you can lazy
                // load them.
                // buildStream = buildStream.pipe(polymerProject.bundler());

                // Now let's generate the HTTP/2 Push Manifest
                buildStream = buildStream.pipe(polymerProject.addPushManifest());

                // Okay, time to pipe to the build directory
                buildStream = buildStream.pipe(gulp.dest(buildDirectory));

                // waitFor the buildStream to complete
                return waitFor(buildStream);
            })
            .then(() => {
                // You did it!
                console.log('Build complete!');
                resolve();
            });
    });
}

gulp.task('build', build);