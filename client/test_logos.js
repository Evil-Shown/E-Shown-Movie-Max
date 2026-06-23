const https = require('https');

const domains = ['shakthitv.lk', 'vasantham.lk', 'babytv.com'];

const testUrl = (url) => {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve(`${url} -> ${res.statusCode} ${res.headers['content-type']} ${res.headers['content-length']}`);
    }).on('error', (e) => resolve(`${url} -> error ${e.message}`));
  });
};

async function main() {
  for (const domain of domains) {
    console.log(`\nTesting ${domain}`);
    console.log(await testUrl(`https://img.logo.dev/${domain}?token=pk_CvtKnlevScSGAPFV3KyoLA&fallback=404`));
    console.log(await testUrl(`https://icon.brandfetch.io/${domain}`));
    console.log(await testUrl(`https://logo.clearbit.com/${domain}`));
    console.log(await testUrl(`https://icons.duckduckgo.com/ip3/${domain}.ico`));
  }
}

main();
