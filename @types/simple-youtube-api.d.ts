declare module 'simple-youtube-api' {
	export default class {
		constructor(key: string);

		key?: string;

		getChannel(url: string, options?: Object): Promise<Channel | null>;
		getChannelByID(id: string, options?: Object): Promise<Channel | null>;
		getPlaylist(url: string, options?: Object): Promise<Playlist | null>;
		getPlaylistByID(id: string, options?: Object): Promise<Playlist | null>;
		getVideo(url: string, options?: Object): Promise<Video | null>;
		getVideoByID(id: string, options?: Object): Promise<Video | null>;
		search(query: string, limit?: number, options?: Object): Promise<Array<Video | Playlist | Channel> | null>;
		searchChannels(query: string, limit?: number, options?: Object): Promise<Array<Channel> | null>;
		searchPlaylists(query: string, limit?: number, options?: Object): Promise<Array<Playlist> | null>;
		searchVideos(query: string, limit?: number, options?: Object): Promise<Array<Video> | null>;
	}

	type DurationObject = {
		days: number;
		seconds: number;
		minutes: number;
		hours: number;
	};

	export class Video {
		constructor();

		channel: Channel;
		description: string;
		duration?: DurationObject;
		durationSeconds: number;
		full: boolean;
		id: string;
		kind: string;
		maxRes: Object;
		publishedAt: Date;
		raw: Object;
		shortURL: string;
		thumbnails: Thumbnails;
		title: string;
		url: string;

		extractID(url: string): string | null;
		fetch(): Video;
	}

	export class Playlist {
		constructor();

		channel: Channel;
		channelTitle?: string;
		defaultLanguage?: string;
		description?: string;
		embedHTML: string;
		id: string;
		length: number;
		localized?: Object;
		privacy: string;
		publishedAt?: Date;
		thumbnails?: Object;
		title?: string;
		type: string;
		url: string;
		videos: Video[];

		extractID(url: string): string | null;
		fetch(): Channel;
		getVideos(limit?: number, options?: Object): Promise<Video[]>;
	}

	export class Channel {
		constructor();

		commentCount?: number;
		country?: string;
		customURL?: string;
		defaultLanguage?: string;
		description?: string;
		full: boolean;
		hiddenSubscriberCount?: boolean;
		id: string;
		kind: string;
		localized?: Object;
		publishedAt?: Date;
		raw: Object;
		relatedPlaylists?: Object;
		subscriberCount?: number;
		thumbnails?: Object;
		title?: string;
		type: string;
		url: string;
		videoCount?: number;
		viewCount?: number;

		extractID(url: string): string | null;
		fetch(): Channel;
	}

	export interface Thumbnails {
		default: Thumbnail;
		medium: Thumbnail;
		high: Thumbnail;
		standard: Thumbnail;
		maxres: Thumbnail;
	}

	export interface Thumbnail {
		url: string;
		width: number;
		height: number;
	}
}
