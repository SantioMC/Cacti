import { MessageEmbed } from 'discord.js';
import { BotClient } from '../../utils/BotClient';
import { Command, ExecuteEvent, PermissionLevel } from '../../utils/Command';
import { Track } from '../../utils/SongManager';

class play extends Command {
  constructor(client: BotClient) {
    super(client, {
      name: 'play',
      description: 'Play a song from youtube.',
      category: 'Music',
      botPermissions: ['SPEAK', 'CONNECT'],
      supportsDJ: true,
      permissionLevel: PermissionLevel.Default,
      aliases: ['p', 'youtube'],
      arguments: [
        {
          name: 'query',
          type: 'String',
          required: true,
          description: 'A term to search on youtube for'
        }
      ]
    });
  }

  execute = async (event: ExecuteEvent) => {
    var query: string = event.unparsedArguments.join(' ');
    var track: Track | null = await event.client.songManager.fetchTrack(query);
    if (track == null) {
      return event.message.channel.send(
        new MessageEmbed()
          .setTitle(' ')
          .setDescription('I was not able to find `' + event.client.clearFormatting(query) + '!')
          .setColor('#ff0000')
      );
    }

    var status: boolean | string = await event.musicQueue?.queue(event.message.member, track);
    if (status == 'NOT_CONNECTED') {
      return event.message.channel.send(new MessageEmbed().setTitle(' ').setColor('#ff0000').setDescription('You are not currently in a voice channel!'));
    } else if (status == 'NO_PERMISSION') {
      return event.message.channel.send(
        new MessageEmbed()
          .setTitle(' ')
          .setColor('#ff0000')
          .setDescription('I do not have permission to enter ' + event.message.member?.voice.channel?.name + '!')
      );
    }

    event.message.channel.send(
      new MessageEmbed()
        .setTitle(' ')
        .setColor(event.embedColor)
        .setDescription(`Added ${track.video.title} to the queue!\n*Requested by ${event.message.author.tag}*`)
    );
  };
}

module.exports = (client: BotClient) => {
  return new play(client);
};
