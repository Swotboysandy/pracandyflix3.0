const axios = require('axios');

const providers = {
  "Moviesmod": { "name": "Moviesmod", "url": "https://moviesmod.kids" },
  "Topmovies": { "name": "Topmovies", "url": "https://moviesleech.eu" },
  "UhdMovies": { "name": "UhdMovies", "url": "https://uhdmovies.stream" },
  "drive": { "name": "moviesDrive", "url": "https://moviesdrive.pics/" },
  "multi": { "name": "multimovies", "url": "https://multimovies.network" },
  "w4u": { "name": "world4ufree", "url": "https://world4ufree.bet/" },
  "hdhub": { "name": "hdhub4u", "url": "https://hdhub4u.rehab/" },
  "kat": { "name": "katmovieshd", "url": "https://katmoviehd.observer" },
  "nfMirror": { "name": "nfMirror", "url": "https://net20.cc" },
  "rive": { "name": "rive", "url": "https://watch.rivestream.app" },
  "filmyfly": { "name": "flimyfly", "url": "https://filmyfly.how/" },
  "4kHDHub": { "name": "4kHDHub", "url": "https://4khdhub.fans" },
  "KMMovies": { "name": "KMMovies", "url": "https://kmmovies.blog/" },
  "DesiReMovies": { "name": "DesiReMovies", "url": "https://desiremovies.group/" },
  "allmovieshub": { "name": "allmovieshub", "url": "https://allmovieshub.surf" },
  "skymovieshd": { "name": "skymovieshd", "url": "https://skymovieshd.mba" },
  "dramafull": { "name": "dramafull", "url": "https://dramafull.cc" },
  "yomovies": { "name": "yomovies", "url": "https://yomovies.tours/" },
  "movies4u": { "name": "movies4u", "url": "https://movies4u.nexus/" },
  "cinevood": { "name": "cinebox", "url": "https://1cinevood.world/" },
  "zinkmovies": { "name": "zinkmovies", "url": "https://new1.zinkmovies.guru/" },
  "filmyclub": { "name": "filmyclub", "url": "https://filmycab.onl/" },
  "oggmovies": { "name": "oggmovies", "url": "https://ogomovies.dad/" },
  "zeefliz": { "name": "zeefliz", "url": "https://zeefliz.lat/" },
  "Vega": { "name": "vegamovies", "url": "https://vegamovies.gripe" },
  "joya9tv": { "name": "joya9tv1", "url": "https://joya9tv1.com" },
  "cinemaLuxe": { "name": "cinemaLuxe", "url": "https://cinemalux.zip/" },
  "themoviesflix": { "name": "themovieflix", "url": "https://themoviesflix.you" },
  "srmovies": { "name": "srmovies", "url": "https://ssrmovies.limited/" },
  "movies4u2": { "name": "movies4u2", "url": "https://movies4u.uz" },
  "consumet": { "name": "consumet", "url": "https://consumet.zendax.tech" },
  "watchulz": { "name": "watchulz", "url": "https://www.watchmovierulz.onl/" }
};

const checkProviders = async () => {
    console.log('Checking providers...');
    console.log('Name'.padEnd(20) + 'Status'.padEnd(10) + 'Time (ms)'.padEnd(10) + 'URL');
    console.log('-'.repeat(80));

    const results = [];

    for (const key in providers) {
        const p = providers[key];
        const start = Date.now();
        try {
            const res = await axios.get(p.url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                },
                timeout: 5000,
                validateStatus: () => true // Don't throw on 404/500
            });
            const time = Date.now() - start;
            console.log(`${p.name.padEnd(20)}${res.status.toString().padEnd(10)}${time.toString().padEnd(10)}${p.url}`);
            results.push({ name: p.name, status: res.status, time, url: p.url });
        } catch (e) {
            const time = Date.now() - start;
            console.log(`${p.name.padEnd(20)}${'ERR'.padEnd(10)}${time.toString().padEnd(10)}${p.url} (${e.message})`);
            results.push({ name: p.name, status: 'ERR', time, url: p.url, error: e.message });
        }
    }

    console.log('\n--- Summary ---');
    const working = results.filter(r => r.status === 200).sort((a, b) => a.time - b.time);
    console.log(`Working: ${working.length}/${Object.keys(providers).length}`);
    console.log('Top 5 Fastest:');
    working.slice(0, 5).forEach(r => console.log(`- ${r.name}: ${r.time}ms`));
};

checkProviders();
