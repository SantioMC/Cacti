import { MessageEmbed, PermissionResolvable } from 'discord.js';
import { BotClient } from '../../utils/BotClient';
import { Command, ExecuteEvent, ICommandData, PermissionLevel } from '../../utils/Command';
import { CommandHandler } from '../../utils/CommandHandler';

class help extends Command {
  constructor(client: BotClient) {
    super(client, {
      name: 'help',
      description: 'View all commands on the bot',
      category: 'Essential',
      permissionLevel: PermissionLevel.Default,
      arguments: []
    });
  }

  execute = async (event: ExecuteEvent) => {
    var commands: ICommandData[] = event.client.commands;
    var guildSpecificCommands: ICommandData[] = commands.filter((command: ICommandData) => command.guild == event.message.guild?.id);
    commands = commands.filter((command: ICommandData) => command.guild == null);

    var embed: MessageEmbed = new MessageEmbed()
      .setTitle('Help Menu')
      .setColor(event.embedColor)
      .setTimestamp()
      .setFooter('Requested by ' + event.message.author.tag);

    var categories: string[] = [];
    commands.forEach((command: ICommandData) => {
      if (!categories.includes(command.category)) categories.push(command.category);
    });
    categories.sort();

    if (event.arguments.length < 1) {
      categories.forEach((category: string) => {
        let commandData = event.client.commands.filter((command: ICommandData) => command.category.toLowerCase() == category.toLowerCase());
        let commands = Array.from(commandData.values());
        let text = '```\n';
        for (let i = 0; i < commands.length && i < 5; i++) text += commands[i].name + '\n';
        if (commands.length > 5) text += '...and ' + (commands.length - 5) + ' more..';
        text += '```';
        embed.addField(category, text, true);
      });

      if (guildSpecificCommands.length > 0) {
        var category: string | undefined = event.message.guild?.name;
        if (category == undefined) category = 'Guild Specific';
        let text = '```\n';
        for (let i = 0; i < guildSpecificCommands.length && i < 5; i++) text += guildSpecificCommands[i].name + '\n';
        if (guildSpecificCommands.length > 5) text += '...and ' + (guildSpecificCommands.length - 5) + ' more..';
        text += '```';
        embed.addField(category, text, true);
      }
    } else {
      if (categories.includes(<string>event.arguments[0])) {
        var category: string | undefined = <string>event.arguments[0];

        let commands = event.client.commands
          .filter((command: ICommandData) => command.category.toLowerCase() == category!.toLowerCase())
          .map((c: ICommandData) => c.name);
        let text = '```\n' + commands.join('\n') + '```';
        embed.addField(category, text);
      } else {
        var command: string = <string>event.arguments[0];
        if (CommandHandler.commands.has(command) || CommandHandler.commands.get(CommandHandler.aliases.get(command) || '')) {
          var commandData: Command | undefined = CommandHandler.commands.get(command) || CommandHandler.commands.get(CommandHandler.aliases.get(command) || '');
          if (commandData == undefined)
            return event.message.channel.send(
              new MessageEmbed().setTitle(' ').setColor('#ff0000').setDescription("I wasn't able to find any category or command from that query!")
            );

          embed.addField('Command Name', `${commandData.data.name} (${commandData.data.category})`, true);
          embed.addField('Command Aliases', `\`\`\`${commandData.data.aliases != undefined ? commandData.data.aliases.join(' ') : 'None'}\`\`\``, true);
          embed.addField('\u200b', '\u200b', true);
          embed.addField('Description', commandData.data.description);
          embed.addField(
            'Syntax',
            commandData.data.arguments == undefined ? 'This command has no extra syntax.' : `\`\`\`html\n${commandData.generateSyntax()}\`\`\``,
            true
          );
          embed.addField(
            'Permissions Required',
            commandData.data.permissions == undefined ? 'This command requires no permissions' : `\`\`\`\n${commandData.data.permissions.join('\n')}\`\`\``,
            true
          );
          embed.addField('\u200b', '\u200b', true);
          if (commandData.data.guild != undefined) embed.addField(' ', ':warning: This command is limited to a certain guild only!');
        } else
          event.message.channel.send(
            new MessageEmbed().setTitle(' ').setColor('#ff0000').setDescription("I wasn't able to find any category or command from that query!")
          );
      }
    }

    event.message.channel.send(embed);
  };
}

module.exports = (client: BotClient) => {
  return new help(client);
};
