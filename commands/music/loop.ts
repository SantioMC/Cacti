import { MessageEmbed } from 'discord.js';
import { BotClient } from '../../utils/BotClient';
import { Command, ExecuteEvent, PermissionLevel } from '../../utils/Command';
import GuildQueue from '../../utils/GuildQueue';

class loop extends Command {
  constructor(client: BotClient) {
    super(client, {
      name: 'loop',
      description: 'Sets a song on repeat',
      category: 'Music',
      supportsDJ: true,
      permissionLevel: PermissionLevel.Developer,
      aliases: ['l', 'repeat']
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

    queue.isLooping() ? queue.disableLoop() : queue.enableLoop();

    event.message.channel.send(
      new MessageEmbed()
        .setTitle(' ')
        .setColor(event.embedColor)
        .setDescription('The track is ' + (queue.isLooping() ? 'now looping' : 'no longer looping') + '!')
    );
  };
}

module.exports = (client: BotClient) => {
  return new loop(client);
};
