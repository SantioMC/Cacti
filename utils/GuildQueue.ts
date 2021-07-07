import { Guild, GuildMember, StreamDispatcher, VoiceChannel, VoiceConnection } from 'discord.js';
import ytdl from 'discord-ytdl-core';
import SongManager, { Track } from './SongManager';
import { BotClient } from './BotClient';

class GuildQueue {
  inQueue: Track[] = [];
  client!: BotClient;
  guild!: Guild;
  songManager!: SongManager;
  current?: Track;
  playing: boolean = false;
  looping: boolean = false;
  loopingQueue: boolean = false;
  djOnly: boolean = false;
  skipVotes: string[] = [];
  connection?: VoiceConnection;
  dispatcher?: StreamDispatcher;

  queue!: Function;
  first!: Function;
  shift!: Function;
  getGuild!: Function;
  getCurrent!: Function;
  get!: Function;
  size!: Function;
  sizeText!: Function;
  isPlaying!: Function;
  shutdown!: Function;
  play!: Function;
  nextSong!: Function;
  skip!: Function;
  skipTo!: Function;
  pause!: Function;
  resume!: Function;
  togglePause!: Function;
  isPaused!: Function;
  isDJOnly!: Function;
  enableDJOnly!: Function;
  disableDJOnly!: Function;
  isLooping!: Function;
  enableLoop!: Function;
  disableLoop!: Function;
  toggleLoop!: Function;
  isLoopingQueue!: Function;
  enableLoopQueue!: Function;
  disableLoopQueue!: Function;
  toggleLoopQueue!: Function;
  isDJ!: Function;
  getConnected!: Function;
  voteSkip!: Function;
  getVoteSkips!: Function;
  clearVoteSkips!: Function;
  setVolume!: Function;
  test!: Function;

  constructor(client: BotClient, guild: Guild) {
    this.client = client;
    this.guild = guild;
    this.songManager = this.client.songManager;
    this.inQueue = [];

    if (this.guild.me?.voice?.connection != null) {
      this.guild.me?.voice?.connection.disconnect();
    }

    this.queue = async function (member: GuildMember, track: Track) {
      // Add to the queue
      track.requestedBy = member;
      this.inQueue.push(track);

      // Handle current song
      if (this.getCurrent() == null && this.size() > 0) {
        this.current = this.shift();
      }

      // Join voice channel if not connected
      if (guild.voice == null || guild.voice.channel == null) {
        if (member.voice == null || member.voice.channel == null) return 'NOT_CONNECTED'; // Not connected to voice channel
        if (!member.voice.channel.joinable) return 'NO_PERMISSION'; // No permission to voice channel
        this.connection = await member.voice.channel.join();
      }

      // Play song if not playing
      if (!this.isPlaying()) await this.play();

      return true;
    };

    this.first = function () {
      return this.inQueue[0];
    };

    this.shift = function () {
      return this.inQueue.shift();
    };

    this.getGuild = function () {
      return guild;
    };

    this.getCurrent = function () {
      return this.current;
    };

    this.get = function () {
      return this.inQueue;
    };

    this.size = function () {
      let s = this.inQueue.length;
      if (this.current != null) s++;
      return s;
    };

    this.sizeText = function () {
      let s = this.size();
      return `${s} track${s == 1 ? '' : 's'}`;
    };

    this.isPlaying = function () {
      return this.playing;
    };

    this.shutdown = function () {
      if (this.dispatcher == null) return;
      this.dispatcher = undefined;
      this.playing = false;
      this.inQueue = [];
      this.current = undefined;
      this.disableLoop();
    };

    this.play = async function () {
      if (this.connection == null) return;
      if (this.playing) return console.log('Attempted to play song for ' + guild.name + ' when already playing!');
      this.playing = true;
      this.clearVoteSkips();
      let track: Track | null = this.getCurrent();
      if (track == null) {
        this.playing = false;
        return;
      }
      let livestream = track.video.duration != null ? this.songManager.isLivestream(track.video.duration) : false;
      let streamSettings: any = livestream ? { quality: [128, 127, 120, 96, 95, 94, 93] } : { filter: 'audioonly' };
      streamSettings.opusEncoded = true;
      streamSettings.highWaterMark = 1 << 25;
      streamSettings.encoderArgs = [
        '-af',
        `aresample=48000
				,asetrate=${track.asetrate || 48000}
				,atempo=${track.speed || 1}
				,bass=g=${track.bass || 0}
				,rubberband=pitch=${track.pitch || 1}`
      ];
      let stream = await ytdl(this.songManager.getURL(track.video.id), streamSettings);
      this.dispatcher = await this.connection.play(stream, {
        volume: 0.5,
        seek: track.seek || 0,
        type: 'opus'
      });
      this.dispatcher.on('finish', () => {
        this.nextSong();
      });
      this.dispatcher.on('end', () => {
        this.nextSong();
      });
    };

    this.nextSong = async function (skipLoop?: boolean, skipLoopQueue?: boolean) {
      if (this.connection == null) return;
      this.playing = false;
      if (!this.looping && !skipLoopQueue && this.current != null && this.loopingQueue) this.inQueue.push(this.current);
      if (skipLoop || !this.looping) {
        this.current = this.shift();
        this.setVolume(100);
      }
      if (skipLoop) this.looping = false;
      if (this.current == undefined) {
        this.shutdown();
        this.connection.disconnect();
        return null;
      } else {
        await this.play();
        return this.current;
      }
    };

    this.skip = async function () {
      this.dispatcher = undefined;
      return await this.nextSong(true);
    };

    this.skipTo = async function (position: number) {
      for (let i = 0; i < position - 1; i++) this.inQueue.shift();
      this.dispatcher = undefined;
      return await this.nextSong(true);
    };

    this.pause = function () {
      if (this.dispatcher == null) return;
      this.dispatcher.pause();
    };

    this.resume = function () {
      if (this.dispatcher == null) return;
      this.dispatcher.resume();
    };

    this.togglePause = function () {
      this.isPaused() ? this.resume() : this.pause();
    };

    this.isPaused = function () {
      if (this.dispatcher == null) return;
      return this.dispatcher.paused;
    };

    this.isLooping = function () {
      return this.looping;
    };

    this.enableLoop = function () {
      this.looping = true;
    };

    this.disableLoop = function () {
      this.looping = false;
    };

    this.toggleLoop = function () {
      this.looping = !this.isLooping();
      return this.isLooping();
    };

    this.isLoopingQueue = function () {
      return this.loopingQueue;
    };

    this.enableLoopQueue = function () {
      this.loopingQueue = true;
    };

    this.disableLoopQueue = function () {
      this.loopingQueue = false;
    };

    this.toggleLoopQueue = function () {
      this.loopingQueue = !this.isLoopingQueue();
      return this.isLoopingQueue();
    };

    this.isDJOnly = function () {
      return this.djOnly;
    };

    this.enableDJOnly = function () {
      this.djOnly = true;
    };

    this.disableDJOnly = function () {
      this.djOnly = false;
    };

    this.getConnected = function () {
      var connection: VoiceConnection | undefined = this.connection;
      if (connection == undefined) return -1;
      var channel: VoiceChannel | null | undefined = connection.voice?.channel;
      if (channel == null) return -1;
      return channel.members.size || -1;
    };

    this.isDJ = function (member: GuildMember, force: boolean = false) {
      var dj: boolean = member.hasPermission('MANAGE_MESSAGES') || member.roles.cache.some((role) => role.name.toLowerCase() == 'dj');
      if (!force && !dj) dj = this.getConnected() <= 2;
      return dj;
    };

    this.voteSkip = function (member: GuildMember) {
      if (this.connection == undefined) return 'NOT_CONNECTED';
      if (this.skipVotes.includes(member.id)) return 'AlREADY_VOTED';
      this.skipVotes.push(member.id);
      return 'SUCCESS';
    };

    this.getVoteSkips = function () {
      return this.skipVotes.length || 0;
    };

    this.clearVoteSkips = function () {
      this.skipVotes = [];
    };

    this.setVolume = function (amount: number) {
      this.dispatcher?.setVolumeLogarithmic(amount / 100);
    };

    this.test = function () {};
  }
}

export default GuildQueue;
