import { Guild, GuildMember, Message, MessageEmbed, PermissionResolvable } from 'discord.js';
import fs = require('fs');
import * as path from 'path';
import { BotClient } from './BotClient';
import { Command, ICommandData, Argument, PermissionLevel } from './Command';
import * as mongoose from 'mongoose';
import { ITag } from '../models/tag';

export class CommandHandler {
  commands: Map<string, Command> = new Map();
  aliases: Map<string, string> = new Map();
  client: BotClient;
  members: GuildMember[];
  args: Object[];

  constructor(client: BotClient) {
    this.client = client;
    this.members = [];
    this.args = [];
    readDir(__dirname + path.sep + '..' + path.sep + 'commands');

    function readDir(directory: string) {
      fs.readdir(path.resolve(directory), (err, files) => {
        if (err) return console.error(err);
        var index: string;
        for (index in files) {
          var file: string = files[index];
          if (file.match('.(js|ts)$')) {
            createCommand(client, file.substring(0, file.length - 3), directory);
          } else if (fs.lstatSync(path.resolve(directory + path.sep + file)).isDirectory()) {
            readDir(directory + path.sep + file);
          }
        }
      });
    }

    const createCommand = (client: BotClient, name: string, dir: string) => {
      var command: Command = require(dir + path.sep + name)(client) as Command;
      this.commands.set(command.data?.name.toLowerCase(), command);
      command.data?.aliases?.forEach((alias: string) => this.aliases.set(alias.toLowerCase(), name.toLowerCase()));

      // TODO: Create slash commands (not important rn)
    };
  }

  async handle(message: Message) {
    const Tag: mongoose.Model<ITag> = mongoose.model('Tag');
    if (['dm', 'group'].includes(message.channel.type)) return;

    this.args = [];
    var botMember: GuildMember | undefined = await message.guild?.members.fetch('' + this.client.user?.id);
    if (!botMember?.hasPermission('SEND_MESSAGES') || !message.guild?.me?.permissionsIn(message.channel).has('SEND_MESSAGES')) return;

    if (message.guild == null) return;

    var prefixLength: number = this.client?.data.prefix.length || 0;
    var parsedArgs: string[] = parseArgs(message.content);
    var command: string | undefined = parsedArgs.shift()?.toLowerCase().substring(prefixLength);
    if (command == undefined) return;
    var commandObject: Command | undefined = this.commands.get(command) || this.commands.get(this.aliases.get(command) || '');
    if (commandObject == undefined) {
      // Tags
      var commandTag: ITag | null = await Tag.findOne({
        name: command.toLowerCase()
      });
      if (commandTag != null) {
        var regex = this.client.IMAGE_REGEX;

        var content: string = commandTag.content;
        // var title: string = content.split('\n')[0];
        // content = content.substring(title.length);

        var memberCount: number = 0;
        this.client.guilds.cache.forEach((g: Guild) => (memberCount += g.memberCount));

        // Placeholders
        content = content.replace('{guildCount}', this.client.guilds.cache.size + '');
        content = content.replace('{memberCount}', memberCount + '');
        content = content.replace(
          '{ram}',
          Math.floor(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB / ' + Math.floor(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB'
        );
        content = content.replace('{owner}', '<@' + commandTag.owner + '>');

        var embed: MessageEmbed = new MessageEmbed()
          .setTitle(' ')
          .setDescription(content)
          .setFooter('Requested by ' + message.author.tag)
          .setColor(this.client.data.embedColor);

        var matches = content.match(regex);
        if (matches) {
          var link = matches[0];
          embed.setDescription(content.replace(link, ''));
          embed.setImage(link);
        }

        message.channel.send(embed);
      }

      return;
    }
    var executeFunction: Function = commandObject.execute;
    var data: ICommandData = commandObject.data;
    if (data.guild != undefined && data.guild != message.guild?.id) return;
    var errorEmbed: MessageEmbed = new MessageEmbed().setTitle(' ').setColor('#ff0000');
    // var queue: GuildQueue = this.client.songManager.getQueue(message.guild);

    // Check bot rank permissions
    var permissionLevel: PermissionLevel = data.permissionLevel;
    if (permissionLevel != PermissionLevel.Default) {
      if (message.member?.id != '239752804468654090' && message.member?.id != '745066029478051920') {
        errorEmbed.setDescription(':x: This command is restricted to the bot developers only.');
        return message.channel.send(errorEmbed);
      }
    }

    // Check bot permissions
    var permissionsLacking: PermissionResolvable[] = [];
    data.botPermissions?.forEach((permission: PermissionResolvable) => {
      if (!botMember?.hasPermission(permission) || !message.guild?.me?.permissionsIn(message.channel).has(permission)) {
        permissionsLacking.push(permission);
      }
    });

    if (permissionsLacking.length > 0) {
      var permissions: string = '';
      permissionsLacking.forEach((permission: PermissionResolvable) => {
        permissions += '- ' + permission.toString() + '\n';
      });
      data.botPermissions
        ?.filter((permission: PermissionResolvable) => !permissionsLacking.includes(permission))
        .forEach((permission: PermissionResolvable) => {
          permissions += permission.toString() + '\n';
        });
      errorEmbed.setDescription(
        'I am lacking permissions to run this command! Please grant me the following:\n*(Red = Missing)*\n```diff\n' + permissions + '```'
      );
      return message.channel.send(errorEmbed);
    }

    // Check member permissions
    permissionsLacking = [];
    data.permissions?.forEach((permission: PermissionResolvable) => {
      if (!message.member?.hasPermission(permission) || !message.member?.permissionsIn(message.channel).has(permission)) {
        permissionsLacking.push(permission);
      }
    });

    if (permissionsLacking.length > 0) {
      permissions = '';
      permissionsLacking.forEach((permission: PermissionResolvable) => {
        permissions += '- ' + permission.toString() + '\n';
      });
      data.permissions
        ?.filter((permission: PermissionResolvable) => !permissionsLacking.includes(permission))
        .forEach((permission: PermissionResolvable) => {
          permissions += permission.toString() + '\n';
        });
      errorEmbed.setDescription('You are missing permissions!\n*(Red = Missing)*\n```diff\n' + permissions + '```');
      return message.channel.send(errorEmbed);
    }

    // Check command arguments
    var requiredArgs = data.arguments?.filter((arg: Argument) => arg.required).length || 0;
    if (parsedArgs.length < requiredArgs) {
      errorEmbed.setDescription(
        'You are missing ' +
          (requiredArgs - parsedArgs.length) +
          ' argument' +
          (requiredArgs - parsedArgs.length == 1 ? '' : 's') +
          '!\n' +
          '```html\n' +
          commandObject.generateSyntax() +
          '\n' +
          '```'
      );
      return message.channel.send(errorEmbed);
    }

    if (data.arguments == undefined || data.arguments?.length == 0) {
      executeFunction({
        message: message,
        client: this.client,
        arguments: [],
        unparsedArguments: parsedArgs,
        members: this.members,
        slashCommand: false,
        embedColor: this.client.data.embedColor,
        loadingEmote: this.client.data.loadingEmote,
        command: command
      });
      return;
    }

    // Check specific arguments
    var index: number = 0;
    var error: Boolean = false;
    var done: number = -1;
    for (var a in data.arguments) {
      var arg: Argument = data.arguments[a];
      var equivalent: string = parsedArgs[index];
      var type: string = arg.type.toLowerCase();
      done++;
      if (equivalent == null) {
        if (!error)
          executeFunction({
            message: message,
            client: this.client,
            arguments: this.args,
            unparsedArguments: parsedArgs,
            members: this.members,
            slashCommand: false,
            embedColor: this.client.data.embedColor,
            loadingEmote: this.client.data.loadingEmote,
            command: command
          });
        return;
      }

      // Check argument types
      if (type == 'number') {
        if (isNaN(Number(equivalent))) {
          errorEmbed.setDescription("The field '" + arg.name + "' is of type " + type.toUpperCase() + '!\nProvided value: `' + equivalent + '`');
          error = true;
          return message.channel.send(errorEmbed);
        } else this.args.push(Number(equivalent));
      } else if (type == 'integer') {
        if (isNaN(Number(equivalent)) || equivalent.includes('.')) {
          errorEmbed.setDescription("The field '" + arg.name + "' is of type " + type.toUpperCase() + '!\nProvided value: `' + equivalent + '`');
          error = true;
          return message.channel.send(errorEmbed);
        } else this.args.push(Number(equivalent));
      } else if (type == 'member') {
        try {
          var member: GuildMember | undefined = await message.guild?.members.fetch(equivalent.replace(/<|@|!|>/g, ''));
        } catch {
          try {
            member = await message.guild?.members.fetch('' + equivalent);
          } catch {
            member = (
              await message.guild?.members.fetch({
                query: '' + equivalent,
                limit: 1
              })
            )?.first();
          }
        }
        if (member == undefined) {
          errorEmbed.setDescription("The field '" + arg.name + "' is of type " + type.toUpperCase() + '!\nUnable to find the member: `' + equivalent + '`');
          error = true;
          return message.channel.send(errorEmbed);
        }
        this.members.push(member);
        this.args.push(member);
      } else if (type == 'boolean') {
        var boolean: Boolean = equivalent == 'true' || equivalent == 'yes' || equivalent == '1';
        this.args.push(boolean);
      } else if (type == 'text' || type == 'string') {
        this.args.push(equivalent);
      } else {
        errorEmbed.setDescription("Invalid field type '" + arg.type + "'! Please contact a developer regarding this issue!");
        error = true;
        return message.channel.send(errorEmbed);
      }

      if (!error && done + 1 == data.arguments.length) {
        executeFunction({
          message: message,
          client: this.client,
          arguments: this.args,
          unparsedArguments: parsedArgs,
          members: this.members,
          embedColor: this.client.data.embedColor,
          loadingEmote: this.client.data.loadingEmote,
          slashCommand: false,
          command: command
        });
      }
      index++;
    }
  }
}

function parseArgs(message: string): string[] {
  var args: string[] = message.match(/[^\s"']+|"([^"]*)"|'([^']*)'/gi) || [];
  args.forEach((arg: string, index: number) => {
    args[index] = arg.replace(/["']/gi, '');
  });
  return args;
}
