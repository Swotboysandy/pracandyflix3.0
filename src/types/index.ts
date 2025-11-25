export interface Link {
    title: string;
    episodesLink: string;
    directLinks?: DirectLink[];
}

export interface DirectLink {
    link: string;
    title: string;
    type: string;
}

export interface Info {
    title: string;
    synopsis: string;
    image: string;
    cast?: string[];
    tags?: string[];
    imdbId: string;
    type: string;
    linkList: Link[];
}
