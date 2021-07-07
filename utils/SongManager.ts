import { Guild, GuildMember } from 'discord.js';
import { BotClient } from './BotClient';
// @ts-ignore
import { DurationObject, Video } from 'simple-youtube-api';
import GuildQueue from './GuildQueue';

export class SongManager {
  client!: BotClient;
  fetchTrack!: Function;
  isURL!: Function;
  getURL!: Function;
  getQueue!: Function;
  parseDuration!: Function;
  isLivestream!: Function;
  isDj!: Function;

  constructor(client: BotClient) {
    this.client = client;

    this.fetchTrack = async function (query: string): Promise<Track | null> {
      let video: Video | null = null;
      try {
        if (this.isURL(query)) {
          video = await this.client.youtube.getVideo(query);
        } else {
          let res = await this.client.youtube.searchVideos(query, 1);
          if (res == null) return null;
          video = await this.client.youtube.getVideo(this.getURL(res[0].id));
        }
      } catch (e) {
        return null;
      }
      if (video == null) return null;
      return {
        video: video
      };
    };

    this.isURL = function (query: string): boolean {
      return /^http([s]?):\/\/([www.]+)?youtube.com\/watch\?v=[A-Z0-9]+/gi.test(query);
    };

    this.getURL = function (id: String): string {
      return `https://youtube.com/watch?v=${id}`;
    };

    this.getQueue = function (guild: Guild): GuildQueue | undefined {
      let queue: GuildQueue | undefined = this.client.queues.get(guild.id);
      if (queue == undefined) {
        this.client.queues.set(guild.id, new GuildQueue(this.client, guild));
        queue = this.client.queues.get(guild.id);
      }
      return queue;
    };

    this.parseDuration = function (duration: DurationObject): string {
      let res = '';
      if (duration.days > 0) res += `${duration.days}d`;
      if (duration.hours > 0) res += `${duration.hours}h`;
      if (duration.minutes > 0) res += `${duration.minutes}m`;
      res += `${duration.seconds}s`;
      if (res == '0s') res = 'LIVE';
      return res;
    };

    this.isLivestream = function (duration: DurationObject): boolean {
      if (this.parseDuration(duration) == 'LIVE') return true;
      return false;
    };
  }
}

export interface Track {
  video: Video;
  requestedBy?: GuildMember;
  bass?: number;
  pitch?: number;
  speed?: number;
  asetrate?: number;
  seek?: number;
}

export default SongManager;
