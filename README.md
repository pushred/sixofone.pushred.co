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

- [gulp][gulp] runs tasks written in JavaScript
- [Browsersync][bs] provides a local server with live reload across devices

Development
-----------

```sh
npm run dev
```

This will:

- Generate a new version of the site
- Launch a preview server for viewing it
- Watch files for changes and trigger gulp tasks as needed

Here’s a diagram of how everything is organized:

    ├── gulpfile.js
    │   └── development tasks
    ├── node_modules
    │   └── third-party code installed from the npm registry and GitHub
    └── server
        └── Generated static pages and files, Browsersync root

[semistandard]: https://github.com/Flet/semistandard
[semistandard-badge]: https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat

[node]: https://nodejs.org
[npm]: https://docs.npmjs.com/getting-started/installing-npm-packages-locally
[npm-permissions]: https://docs.npmjs.com/getting-started/fixing-npm-permissions

[gulp]: http://gulpjs.com/
[bs]: https://www.browsersync.io/
