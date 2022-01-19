import { CommandHandler } from './CommandHandler';
import * as discordbtn from 'discord-buttons';
import { ICommandData } from './Command';
import { IListenerData } from './Listener';
import { ListenerHandler } from './ListenerHandler';
import { InfractionUtils } from './InfractionUtils';

require('discord-reply');
import Discord = require('discord.js');
import GuildQueue from './GuildQueue';
import SongManager from './SongManager';

const YouTube = require('simple-youtube-api');

export interface IClientData {
  token: string;
  name: string;
  prefix: string;
  youtubeKey: string;
  embedColor: string;
  loadingEmote: string;
  btnManager?: typeof discordbtn;
}

export class BotClient extends Discord.Client {
  commands: Array<ICommandData> = [];
  events: Array<IListenerData> = [];
  data!: IClientData;
  clearFormatting!: Function;
  queues: Map<string, GuildQueue> = new Map();
  afk: Map<string, string | null> = new Map();
  reactions: Map<string, string> = new Map();
  specialCharacters: Map<string, string> = new Map();
  youtube!: any;
  songManager!: SongManager;

  EMOTE_REGEX!: RegExp;
  IMAGE_REGEX!: RegExp;

  constructor(data: IClientData) {
    // Init
    super({ disableMentions: 'all' });

    if (data.token == null) return;
    if (data.name == null) data.name = 'No Name Supplied';
    if (data.prefix == null) data.prefix = '.';

    this.EMOTE_REGEX = /<:.+:(\d+)>/i;
    this.IMAGE_REGEX = /https?:\/\/(?:\w+\.)?[\w-]+\.[\w]{2,3}(?:\/[\w-_.]+)+\.(?:png|jpg|jpeg|gif|webp)/i;

    this.data = data;
    this.youtube = new YouTube(data.youtubeKey);
    this.songManager = new SongManager(this);
    var commandHandler: CommandHandler = new CommandHandler(this);

    this.registerMaps();

    this.clearFormatting = (message: String, strict: boolean = true): String => {
      message = message.replace(/​/gi, '');
      if (strict) return message.replace(/(`|\*|_|~|\\)/gi, '');
      return message.replace(/(`|\*|_|~|\\)/gi, '\\$1');
    };

    this.on('message', (message: Discord.Message) => {
      if (message.author.bot || message.channel.type != 'text') return;
      if (!message.content.startsWith(data.prefix)) return;
      commandHandler.handle(message);
    });

    this.on('ready', () => {
      console.log('Logged in as ' + this.user?.tag);
      data.token = '<hidden>';

      // Create listeners
      new ListenerHandler(this);
    });

    this.login(data.token);
    InfractionUtils.startExpireChecker(this);
  }

  registerMaps = () => {
    this.reactions.set('A', '🇦');
    this.reactions.set('B', '🇧');
    this.reactions.set('C', '🇨');
    this.reactions.set('D', '🇩');
    this.reactions.set('E', '🇪');
    this.reactions.set('F', '🇫');
    this.reactions.set('G', '🇬');
    this.reactions.set('H', '🇭');
    this.reactions.set('I', '🇮');
    this.reactions.set('J', '🇯');
    this.reactions.set('K', '🇰');
    this.reactions.set('L', '🇱');
    this.reactions.set('M', '🇲');
    this.reactions.set('N', '🇳');
    this.reactions.set('O', '🇴');
    this.reactions.set('P', '🇵');
    this.reactions.set('Q', '🇶');
    this.reactions.set('R', '🇷');
    this.reactions.set('S', '🇸');
    this.reactions.set('T', '🇹');
    this.reactions.set('U', '🇺');
    this.reactions.set('V', '🇻');
    this.reactions.set('W', '🇼');
    this.reactions.set('X', '🇽');
    this.reactions.set('Y', '🇾');
    this.reactions.set('Z', '🇿');
    this.reactions.set('0', '0️⃣');
    this.reactions.set('1', '1️⃣');
    this.reactions.set('2', '2️⃣');
    this.reactions.set('3', '3️⃣');
    this.reactions.set('4', '4️⃣');
    this.reactions.set('5', '5️⃣');
    this.reactions.set('6', '6️⃣');
    this.reactions.set('7', '7️⃣');
    this.reactions.set('8', '8️⃣');
    this.reactions.set('9', '9️⃣');

    this.reactions.set('с', 'c');
    this.reactions.set('о', '0');
  };
}
