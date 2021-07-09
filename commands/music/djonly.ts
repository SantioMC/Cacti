import { MessageEmbed } from 'discord.js';
import { BotClient } from '../../utils/BotClient';
import { Command, ExecuteEvent, PermissionLevel } from '../../utils/Command';
import GuildQueue from '../../utils/GuildQueue';

class djonly extends Command {
  constructor(client: BotClient) {
    super(client, {
      name: 'djonly',
      description: 'Toggles the DJ only state',
      category: 'Music',
      permissionLevel: PermissionLevel.Developer,
      aliases: ['dj', 'toggledj', 'staffonly', 'togglemusic']
    });
  }

  execute = async (event: ExecuteEvent) => {
    var queue: GuildQueue | undefined = event.musicQueue;
    if (queue == undefined) return;

    if (!(event.message.member?.hasPermission('MANAGE_MESSAGES') || event.message.member?.roles.cache.some((role) => role.name.toLowerCase() == 'dj'))) {
      return event.message.channel.send(
        new MessageEmbed()
          .setTitle(' ')
          .setColor('#ff0000')
          .setDescription('You need to be a DJ to do this!')
          .setFooter('Requested by ' + event.message.author.tag)
          .setTimestamp()
      );
    }

    queue.isDJOnly() ? queue.disableDJOnly() : queue.enableDJOnly();

    event.message.channel.send(
      new MessageEmbed()
        .setTitle(' ')
        .setColor(event.embedColor)
        .setDescription('The queue is now ' + (queue.isDJOnly() ? 'restricted' : 'open') + '!')
        .setFooter('Requested by ' + event.message.author.tag)
        .setTimestamp()
    );
  };
}

module.exports = (client: BotClient) => {
  return new djonly(client);
};
