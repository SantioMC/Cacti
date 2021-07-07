import { Guild, GuildMember, StreamDispatcher, VoiceConnection } from 'discord.js';
import { BotClient } from '../../WomboTS/utils/BotClient';
import { Track, SongManager } from '../utils/SongManager';

declare module 'GuildQueue' {
  export default class {
    constructor(client: BotClient, guild: Guild);

    inQueue: Track[];
    client: BotClient;
    guild: Guild;
    songManager: SongManager;
    current?: Track;
    playing: boolean;
    looping: boolean;
    djOnly: boolean;
    connection?: VoiceConnection;
    dispatcher?: StreamDispatcher;

    queue(member: GuildMember, track: Track): Promise<boolean | string>;
    first(): Track | undefined;
    shift(): Track | null;
    getGuild(): Guild;
    getCurrent(): Track | undefined;
    get(): Track | undefined;
    size(): number;
    sizeText(): string;
    isPlaying(): boolean;
    shutdown(): null;
    play(): null;
    nextSong(skipLoop?: boolean): Promise<Track | null>;
    skip(): Promise<Track | null>;
    skipTo(): Promise<Track | null>;
    pause(): null;
    resume(): null;
    togglePause(): null;
    isPaused(): boolean;
    isDJOnly(): boolean;
    enableDJOnly(): null;
    disableDJOnly(): null;
    isLooping(): boolean;
    enableLoop(): null;
    disableLoop(): null;
    toggleLoop(): null;
    isLoopingQueue(): boolean;
    enableLoopQueue(): null;
    disableLoopQueue(): null;
    toggleLoopQueue(): null;
    getConnected(): number;
    isDJ(member: GuildMember): boolean;
    voteSkip(member: GuildMember): string;
    getVoteSkips(): number;
    clearVoteSkips(): null;
  }
}
