sixofone.pushred.co
===================

[![Semistandard Style][semistandard-badge]][semistandard]

This is a post template for Six Of One. 

Table of Contents
-----------------

- [Dependencies](#dependencies)
- [Development](#development)

Dependencies
------------

**[node.js and npm][node]** generate new versions of the site and run a local preview server.<br>
These can be installed together with easy installers downloadable at nodejs.org.

**[Install the dependencies below][npm]** with `npm install`.<br>
If this runs into any trouble, please try npm’s recommendations on [fixing permissions][npm-permissions].

### Development

- [Browsersync][bs] provides a local server with live reload across devices
- [env-cmd][env-cmd] sources environment variables crossplatform, from a JSON file
- [gulp][gulp] runs tasks written in JavaScript
- [gulp-s3-upload][gulp-s3-upload] uploads piped files to a S3 bucket/CloudFront
- [postcss][postcss] bundles and transpiles future CSS
- [sharp][sharp] resizes images using [libvips][libvips]
- [svgstore][svgstore] bundles SVG files into a [sprite][sprites]
- [svgmin][svgmin] optimizes bundled SVGs and normalizes color with [SVGO][svgo]

Development
-----------

Here’s a diagram of how everything is organized:

    ├── browser
    │   └── :root variables, property sets, and global styles
    ├── components
    │   └── UI/design elements
    ├── exercise
    │   └── source files
    ├── gulpfile.js
    │   └── build/development task orchestration
    ├── node_modules
    │   └── third-party code installed from the npm registry and GitHub
    ├── server
    │   └── generated static pages and files, Browsersync/CloudFront root
    └── gulpfile.js
        └── development tasks

### Scripts

```sh
npm run dev
```

- Source environment variables
- Generate a new version of the site
- Launch a preview server for viewing it
- Watch files for changes and trigger gulp tasks as needed

```sh
npm run lint
npm run lint:staged
```

- Runs semistandard against all JS files or those staged for the next commit

```sh
npm run task <name>
```

- Source environment variables
- Run a specified gulp task

### gulp Tasks

#### `bundleCSS`

- Transpiles CSS syntax (variables, property sets, nesting) into better supported CSS
- Inlines @imports into a single file
- Autoprefixes experimental properties for supported browsers

#### `bundleSVG`

- Consolidates SVG files from `/server/files/icons` into a single file as `<symbol>` elements
- Minifies SVG markup
- Normalizes fill colors as `currentColor` value for cascading color from context 

#### `resizeImages`

- Generates a range of image sizes for JPEGs found within `server/files`
- Uploads images to S3/CloudFront, accessible at `http://sixofone.pushred.co/files/*`
- Generated files are suffixed with `-{width}w` for usage with srcset
- The file closest to 300k is suffixed as `-fallback` for usage with `src`
- The smallest file is suffixed as `-smallest` for usage in preview thumbnails, etc.


[semistandard]: https://github.com/Flet/semistandard
[semistandard-badge]: https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat

[node]: https://nodejs.org
[npm]: https://docs.npmjs.com/getting-started/installing-npm-packages-locally
[npm-permissions]: https://docs.npmjs.com/getting-started/fixing-npm-permissions

[bs]: https://www.browsersync.io/
[env-cmd]: https://github.com/toddbluhm/env-cmd
[gulp]: http://gulpjs.com/
[gulp-s3-upload]: https://github.com/clineamb/gulp-s3-upload
[libvips]: http://www.vips.ecs.soton.ac.uk/
[sharp]: https://github.com/lovell/sharp
[svgstore]: https://github.com/w0rm/gulp-svgstore
[svgmin]: https://github.com/ben-eb/gulp-svgmin
[svgo]: https://github.com/svg/svgo

[sprites]: https://css-tricks.com/svg-symbol-good-choice-icons/
