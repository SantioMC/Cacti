import { Model, model, CallbackError } from 'mongoose';
import Infraction, { IInfraction } from '../models/infraction';
import ms from 'ms';
import { Guild, GuildMember, MessageEmbed, Role, User } from 'discord.js';
import { BotClient } from './BotClient';

export interface RawInfraction {
  id: string;
  type: string;
  guild: string;
  timePunished?: number;
  length?: number;
  victim: string;
  staff: string;
  reason: string;
  active?: boolean;
}

export class InfractionUtils {
  Infraction: Model<IInfraction> = model('Infraction');

  static generateID(len: number): string {
    const usable = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    var ret: string = '';
    for (var i: number = 0; i < len; i++) ret += usable[Math.floor(Math.random() * usable.length)];
    return ret;
  }

  static async generateUniqueID(guild: string): Promise<string> {
    const Infraction: Model<IInfraction> = model('Infraction');
    var len: number = 4;
    var tries: number = 0;
    var ret: string = '';

    while (ret == '') {
      var attempt: string = this.generateID(len);
      var exists: IInfraction | null = await Infraction.findOne({ guild: guild, id: attempt });
      if (exists == null) ret = attempt;
      else {
        tries++;
        if (tries % 3 == 0) len++;
      }
    }

    return ret;
  }

  static async getLatestActiveInfraction(guild: string, user: string, type: string | undefined): Promise<IInfraction | null> {
    return Infraction.findOne({ guild: guild, victim: user, type: type, active: true });
  }

  static async getInfraction(guild: string, query: string, type: string | undefined): Promise<IInfraction | null> {
    var ret: IInfraction | null;
    query = query.replace(/<|@|>|!/gi, '');
    ret = await Infraction.findOne({ guild: guild, id: query, type });
    if (ret == null) ret = await this.getLatestActiveInfraction(guild, query, type);
    return ret;
  }

  static async issueInfraction(data: RawInfraction, update: boolean = true): Promise<boolean> {
    data.timePunished = new Date().getTime();
    if (!update) {
      Infraction.create(data);
      return false;
    }
    var infraction: IInfraction | null = await this.getLatestActiveInfraction(data.guild, data.victim, data.type);
    if (infraction == null) {
      Infraction.create(data);
      return false;
    }

    Infraction.updateOne(
      { guild: data.guild, id: data.id },
      {
        timePunished: new Date().getTime(),
        length: data.length,
        reason: data.reason
      }
    );
    return true;
  }

  static getTime(time: string): number {
    var ret: number;
    try {
      ret = ms(time) || -1;
    } catch (_ignored) {
      ret = -1;
    }
    return ret;
  }

  static getReason(args: string[]): string {
    if (this.getTime(args[0]) == -1 && ['forever', '-1', 'perm', '-p', '-perm'].includes(args[0])) args.shift();
    else if (this.getTime(args[0]) != -1) args.shift();
    return args.join(' ') == '' ? 'No reason provided' : args.join(' ');
  }
  static async expireInfraction(client: BotClient, infraction: IInfraction) {
    var inf: IInfraction | null = await Infraction.findOne({ guild: infraction.guild, id: infraction.id });
    if (inf == null || !inf.active) return;
    var guild: Guild | null = await client.guilds.fetch(inf.guild);
    if (guild == null) return;

    try {
      switch (infraction.type) {
        case 'MUTE':
          var role: Role | undefined = guild.roles.cache.filter((r: Role) => r.name.toLowerCase() == 'muted').first();
          if (role == null) return;
          var user: GuildMember | null = await guild.members.fetch(inf.victim);
          if (user != null) user.roles.remove(role);
          break;
        case 'BAN':
          guild.members.unban(inf.victim);
          break;
      }
    } catch (_ignored) {}

    await Infraction.updateOne({ guild: infraction.guild, id: infraction.id }, { active: false });

    var res: User | undefined = await client.users.fetch(inf.victim);
    if (res != null) res.send(new MessageEmbed().setTitle(' ').setColor(client.data.embedColor).setDescription('Your previous infraction has expired!'));
  }

  static startExpireChecker(client: BotClient) {
    setInterval(async () => {
      Infraction.find({ active: true, length: { $ne: -1 } }, (_err: CallbackError, infractions: IInfraction[] | null) => {
        if (infractions == null) return;
        infractions.forEach((inf: IInfraction) => {
          var expires: number = inf.timePunished + inf.length;
          if (new Date().getTime() >= expires) this.expireInfraction(client, inf);
        });
      });
    }, 5000);
  }
}
