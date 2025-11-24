import axios from 'axios';
// @ts-ignore
const cheerio = require('react-native-cheerio');

const TARGET_URL = 'https://odd-cloud-1e14.hunternisha55.workers.dev/?url=https://net51.cc/home&cookie=user_token=0b9f0991e238ee73b1ce39dbf5639c27;%20t_hash=78ad8a001ef5ccb45538e1a671faeab7%3A%3A1763611120%3A%3Ani;%20t_hash_t=fbc814bbb864b0cc7c8a4aac10d5117b%3A%3Ad4e78f96b1de3339e08a9d2796a077c2%3A%3A1763728839%3A%3Ani;';

export interface Movie {
    id: string;
    title: string;
    imageUrl: string;
}

export interface Section {
    title: string;
    movies: Movie[];
}

export const fetchHomeData = async (): Promise<Section[]> => {
    try {
        const response = await axios.get(TARGET_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            },
        });

        const html = response.data;
        const $ = cheerio.load(html);
        const sections: Section[] = [];

        // Parse Billboard (Hero)
        const billboard = $('.billboard-row').first();
        if (billboard.length > 0) {
            const heroImg = billboard.find('.hero-image-wrapper img').attr('src');
            const titleImg = billboard.find('.billboard-title img').attr('src');
            const synopsis = billboard.find('.synopsis').text().trim();
            const id = billboard.find('.billboard-links').attr('data-post') || 'hero';

            if (heroImg) {
                sections.push({
                    title: 'Featured',
                    movies: [{
                        id,
                        title: 'Featured',
                        imageUrl: heroImg,
                        // We can add more fields if needed like synopsis or titleImg
                    }]
                });
            }
        }

        // Parse Rows
        $('.lolomoRow').each((_: any, rowElem: any) => {
            const row = $(rowElem);
            const title = row.find('.row-header-title').text().trim();

            const movies: Movie[] = [];
            row.find('.slider-item').each((__: any, itemElem: any) => {
                const item = $(itemElem);
                const id = item.attr('data-post');
                const img = item.find('img.boxart-image');
                const src = img.attr('data-src') || img.attr('src');
                const alt = img.attr('alt') || 'Movie';

                if (id && src) {
                    movies.push({
                        id,
                        title: alt,
                        imageUrl: src,
                    });
                }
            });

            if (movies.length > 0 && title) {
                sections.push({
                    title,
                    movies,
                });
            }
        });

        return sections;
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
};

export const debugHtml = async () => {
    try {
        const response = await axios.get(TARGET_URL);
        console.log(response.data);
    } catch (e) {
        console.error(e);
    }
}
