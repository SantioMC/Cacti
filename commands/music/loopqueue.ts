import { MessageEmbed } from 'discord.js';
import { BotClient } from '../../utils/BotClient';
import { Command, ExecuteEvent, PermissionLevel } from '../../utils/Command';
import GuildQueue from '../../utils/GuildQueue';

class loopqueue extends Command {
  constructor(client: BotClient) {
    super(client, {
      name: 'loopqueue',
      description: 'Sets the guild queue on repeat',
      category: 'Music',
      supportsDJ: true,
      permissionLevel: PermissionLevel.Default,
      aliases: ['lq', 'repeatqueue']
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

    queue.isLoopingQueue() ? queue.disableLoopQueue() : queue.enableLoopQueue();

    event.message.channel.send(
      new MessageEmbed()
        .setTitle(' ')
        .setColor(event.embedColor)
        .setDescription('The queue is ' + (queue.isLoopingQueue() ? 'now looping' : 'no longer looping') + '!')
    );
  };
}

module.exports = (client: BotClient) => {
  return new loopqueue(client);
};
