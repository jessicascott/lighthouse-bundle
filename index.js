#!/usr/bin/env node

const lighthouse = require('lighthouse');
const puppeteer = require('puppeteer');
const program = require('commander');
const fs = require('fs');

/*
  User settings
*/
program
  .version(require('./package.json').version)
  .option('-u, --user <user>', 'your username', null, '')
  .option('-p, --pass <pass>', 'your password', null, '')
  .option('-o, --out [out]', `the output folder to place reports, defaults to './lighthouse-reports'`)
  .option('-s, --sites [sites]', `the file that contains a list of sites, defaults to './sites.js'`)
  .option('-v, --verbose', 'enable verbose logging')
  .parse(process.argv);

const PWD = process.env.PWD;
const siteFile = program.sites ? `${PWD}/${program.sites}` : `${PWD}/sites.js`;
const sites = require(siteFile);

const outputDir = program.out ? `${program.out}` : `lighthouse-reports`;
if (!fs.existsSync(outputDir)){
  fs.mkdirSync(outputDir);
}

const settings =  {
    headless: false,
    args: [
        '--remote-debugging-port=9222'
    ]
};

loopSites(sites);

async function runChrome(url, arg, fileName, subDir) {
  const browser = await puppeteer.launch(settings);
  const page = await browser.newPage();
  if (arg.user && arg.pass) {
    await page.authenticate({username: arg.user, password: arg.pass});
  }
  const results = await page.goto(url).then(() => {
    return lighthouse(url, settings).then((results) => {
      if (!fs.existsSync(`${PWD}/${outputDir}/${subDir}`)){
        fs.mkdirSync(`${PWD}/${outputDir}/${subDir}`);
      }

      const total = results.reportCategories.reduce((sum, cat) => sum + cat.score, 0);
      const score = total / results.reportCategories.length;

      const summary = {
        score: score,
        url: url,
        json: `${outputDir}/${subDir}/${fileName}.json`
      };

      fs.writeFile(`${PWD}/${outputDir}/${subDir}/${fileName}.json`, JSON.stringify(results, null, 4), 'utf8', (err) => {
        if (err) throw err;
        console.log(`Lighthouse complete. Output written to ${outputDir}/${subDir}/${fileName}.json`);
      });
      return summary;

    });
  });
  await browser.close();

  return results;
};

async function loopSites(sites) {
  const report = [];
  for (let site of sites) {
    for (let route of site.routes) {
      const url = `${site.baseUrl}${route}`;
      const subDir = site.name.replace(/\s+/g, '-').toLowerCase();
      const fileName = route !== '/' ? route.substring(route.lastIndexOf('/')  + 1) : 'home';
      const summary = await runChrome(url, program, fileName, subDir);
      summary.name = `${site.name} - ${fileName}`;
      report.push(summary);
    }
  }
  fs.writeFileSync(`${PWD}/${outputDir}/summary.json`, JSON.stringify(report, null, 4), 'utf8');

  console.log(`Done! A summary is available in ${outputDir}/summary.json`);
}
