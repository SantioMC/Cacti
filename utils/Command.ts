import { GuildMember, Message, PermissionResolvable } from 'discord.js';
import { BotClient } from './BotClient';

export class Command {
  public data!: ICommandData;
  public client!: BotClient;
  public execute: Function = () => {
    throw new Error('This command was not given an executive function!');
  };

  public generateSyntax(): String {
    var args: String = '';
    this.data.arguments?.forEach((a: Argument) => {
      var type: String = this.fixFormatting(a.type);
      if (a.required) args += '<' + a.name.toLowerCase() + ': ' + type + '> ';
      else args += '[' + a.name.toLowerCase() + ': ' + type + '] ';
    });
    return this.client.data?.prefix + this.data.name.toLowerCase() + (args.length > 1 ? ' ' : '') + args.substring(0, args.length - 1);
  }

  private fixFormatting(original: String): String {
    return original.split('')[0].toUpperCase() + original.substring(1).toLowerCase();
  }

  constructor(client: BotClient, data: ICommandData) {
    this.data = data;
    this.client = client;
    client.commands.push(data);
  }
}

export interface ICommandData {
  name: string;
  description: string;
  category: string;
  guild?: string;
  aliases?: string[];
  permissions?: PermissionResolvable[];
  botPermissions?: PermissionResolvable[];
  permissionLevel: PermissionLevel;
  supportsDJ?: boolean;
  arguments?: Argument[];
}

export interface Argument {
  name: string;
  description: string;
  required: boolean;
  type: string;
}

export interface ExecuteEvent {
  message: Message;
  command: string;
  arguments: Object[];
  unparsedArguments: string[];
  client: BotClient;
  members: GuildMember[];
  slashCommand: Boolean;
  embedColor: string;
  loadingEmote: string;
}

export enum PermissionLevel {
  Default,
  Staff,
  Developer
}
