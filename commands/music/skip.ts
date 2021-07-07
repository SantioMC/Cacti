import { MessageEmbed } from 'discord.js';
import { BotClient } from '../../utils/BotClient';
import { Command, ExecuteEvent, PermissionLevel } from '../../utils/Command';
import GuildQueue from '../../utils/GuildQueue';
import { Track } from '../../utils/SongManager';

class skip extends Command {
  constructor(client: BotClient) {
    super(client, {
      name: 'skip',
      description: 'Skips the current song and goes to the next',
      category: 'Music',
      supportsDJ: true,
      permissionLevel: PermissionLevel.Default,
      aliases: ['s', 'next', 'nextsong', 'nexttrack']
    });
  }

  execute = async (event: ExecuteEvent) => {
    var queue: GuildQueue = event.musicQueue;
    if (!queue.isPlaying) {
      return event.message.channel.send(new MessageEmbed().setTitle(' ').setColor('#ff0000').setDescription('There is nothing playing!'));
    }

    if (!queue.isDJ(event.message.member)) {
      var success: string = queue.voteSkip(event.message.member);
      var required: number = Math.floor(queue.getConnected() / 2);
      if (success == 'AlREADY_VOTED') {
        return event.message.channel.send(new MessageEmbed().setTitle(' ').setColor('#ff0000').setDescription('You already voted to skip!').setTimestamp());
      } else {
        if (queue.getVoteSkips() < required)
          return event.message.channel.send(
            new MessageEmbed()
              .setTitle(' ')
              .setColor(event.embedColor)
              .setDescription('You voted to skip! (' + queue.getVoteSkips() + '/' + required + ')')
              .setFooter('Requested by ' + event.message.author.tag)
              .setTimestamp()
          );
      }
    }

    var track: Track | null = queue.skip();

    if (track == null) {
      event.message.channel.send(
        new MessageEmbed()
          .setTitle(' ')
          .setColor(event.embedColor)
          .setDescription('**Track skipped!**\nThere is nothing left in the queue.')
          .setFooter('Requested by ' + event.message.author.tag)
          .setTimestamp()
      );
    } else {
      event.message.channel.send(
        new MessageEmbed()
          .setTitle(' ')
          .setColor(event.embedColor)
          .setDescription('**Track skipped!**\nNow playing: ' + (track.video?.title || 'Unknown!'))
          .setFooter('Requested by ' + event.message.author.tag)
          .setTimestamp()
      );
    }
  };
}

module.exports = (client: BotClient) => {
  return new skip(client);
};
