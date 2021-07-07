import { MessageEmbed } from 'discord.js';
import { BotClient } from '../../utils/BotClient';
import { Command, ExecuteEvent, PermissionLevel } from '../../utils/Command';
import GuildQueue from '../../utils/GuildQueue';

class stop extends Command {
  constructor(client: BotClient) {
    super(client, {
      name: 'stop',
      description: 'Clears the queue and ends the existing song',
      category: 'Music',
      supportsDJ: true,
      permissionLevel: PermissionLevel.Default,
      aliases: ['d', 'disconnect', 'end']
    });
  }

  execute = async (event: ExecuteEvent) => {
    var queue: GuildQueue | undefined = event.musicQueue;
    if (queue == undefined) return;
    if (!queue.isPlaying) {
      return event.message.channel.send(new MessageEmbed().setTitle(' ').setColor('#ff0000').setDescription('There is nothing playing!'));
    }

    if (!queue.isDJ(event.message.member)) {
      return event.message.channel.send(new MessageEmbed().setTitle(' ').setColor('#ff0000').setDescription('You need to be a DJ to do this!'));
    }

    queue.shutdown();
    queue.connection?.disconnect();

    event.message.channel.send(
      new MessageEmbed()
        .setTitle(' ')
        .setColor(event.embedColor)
        .setDescription('Successfully cleared and disconnected the queue!')
        .setFooter('Requested by ' + event.message.author.tag)
        .setTimestamp()
    );
  };
}

module.exports = (client: BotClient) => {
  return new stop(client);
};
