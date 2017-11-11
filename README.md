Run lighthouse against multiple websites and pages. `lighthouse-bundle` generates a report for each site and a top level `summary.json` file.

Note: This package uses Puppeteer and uses async/await which is only supported in Node v7.6.0 or greater

Set your list of sites up as a module export

```
/* sites.js */
module.exports = [
  {
    name: 'Youtube',
    baseUrl: 'https://youtube.com',
    routes: [
      '/',
      '/feed/trending',
      '/feed/history'
    ]
  },
  {
    name: 'Github',
    baseUrl: 'https://github.com',
    routes: [
      '/',
      '/issues'
    ]
  }
]

### Useage

```
// Default command looks for a `./sites.js` file, and generates the output in `./lighthouse-reports`

lighthouse-bundle

// Add options to the command

lighthouse-bundle -s mysites.js -o public/reports

// Need to login to the website? Add authentication

lighthouse-bundle -u youruser -p yourpas
```


```
lighthouse-bundle [options]

Options:

  -s, --sites <sites>    the file that contains a list of sites, defaults to './sites.js
  -o, --out [out]        the output folder to place reports, defaults to './lighthouse-reports'
  -u, --user <user>      your username for authentication
  -p, --pass <pass>      your password for authentication
  -v, --verbose          enable verbose logging
```