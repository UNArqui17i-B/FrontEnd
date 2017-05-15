'use strict';

const BACK_PORT = process.env.BACK_PORT || '5000';
const BACK_URL = process.env.BACK_URL || 'localhost';

const del = require('del');
const gulp = require('gulp');
const gulpif = require('gulp-if');
const mergeStream = require('merge-stream');
const polymerBuild = require('polymer-build');

// Additional plugins can be used to optimize your source files after splitting.
const uglify = require('gulp-uglify');
const cssSlam = require('css-slam').gulp;
const htmlMinifier = require('gulp-html-minifier');
const replace = require('gulp-string-replace');

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

        // Okay, so first thing we do is clear the build directory
        console.log(`Deleting ${buildDirectory} directory...`);
        del([buildDirectory])
            .then(() => {

                // Let's start by getting your source files. These are all the files
                // in your `src/` directory, or those that match your polymer.json
                // "sources"  property if you provided one.
                let sourcesStream = polymerProject.sources()

                    // The `sourcesStreamSplitter` created above can be added here to
                    // pull any inline styles and scripts out of their HTML files and
                    // into seperate CSS and JS files in the build stream. Just be sure
                    // to rejoin those files with the `.rejoin()` method when you're done.
                    .pipe(sourcesStreamSplitter.split())

                    // Uncomment these lines to add a few more example optimizations to your
                    // source files, but these are not included by default. For installation, see
                    // the require statements at the beginning.
                    .pipe(gulpif(/\.js$/, uglify()))
                    .pipe(gulpif(/\.css$/, cssSlam()))
                    .pipe(gulpif(/\.html$/, htmlMinifier()))
                    .pipe(gulpif(/BlinkBox-app\.html/, replace('BACK_URL', BACK_URL + ':' + BACK_PORT)))

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