import {BotClient} from '../utils/BotClient';
import {Listener} from '../utils/Listener';
import {GuildMember, MessageEmbed, MessageReaction, PartialUser, User} from 'discord.js';

export class afkListener extends Listener {
  constructor(client: BotClient) {
    super(client, {
      name: 'Poll Listener'
    });

    client.on('messageReactionAdd', async (reaction: MessageReaction, user: User | PartialUser) => {
      if (reaction.me || reaction.message.author.id != this.client.user?.id) return;
      if (reaction.message.embeds.length < 1) return;

      var embed: MessageEmbed = reaction.message.embeds[0];
      var embedData: string[] | undefined = embed.description?.split('\n');
      if (embedData == null || embedData[embedData.length - 1].includes('Poll closed') || !(embedData[0] == '**POLL**')) return;
      var reactions = reaction.message.reactions.cache.array();

      var offset: number = 0;
      for (var index in reactions) {
        if (reactions[index].emoji == reaction.emoji) offset = parseInt(index);
      }

      if (offset == reactions.length - 1) {
        var member: GuildMember | undefined = await reaction.message.guild?.members.fetch(user.id);
        if (member == null) return;

        if (!member.hasPermission('MANAGE_MESSAGES')) return reaction.users.remove(member);
        reaction.message.reactions.removeAll();
        embedData[embedData.length - 1] += ' | Poll closed by <@' + member.id + '>';
        embed.setDescription(embedData.join('\n'));
        embed.setColor('#ff0000');
        return reaction.message.edit(' ', embed);
      }

      var line: string = embedData[4 + offset];
      var amount: number = (reaction.count || 1) - 1;

      embedData[4 + offset] = line.split(': ')[0] + ': ' + amount;
      embed.setDescription(embedData.join('\n'));
      reaction.message.edit(' ', embed);
    });

    client.on('messageReactionRemove', async (reaction: MessageReaction) => {
      if (reaction.me || reaction.message.author.id != this.client.user?.id) return;
      if (reaction.message.embeds.length < 1) return;

      var embed: MessageEmbed = reaction.message.embeds[0];
      var embedData: string[] | undefined = embed.description?.split('\n');
      if (embedData == null || embedData[embedData.length - 1].includes('Poll closed') || !(embedData[0] == '**POLL**')) return;
      var reactions = reaction.message.reactions.cache.array();

      var offset: number = 0;
      for (var index in reactions) {
        if (reactions[index].emoji == reaction.emoji) offset = parseInt(index);
      }

      if (offset == reactions.length - 1) return;

      var line: string = embedData[4 + offset];
      var amount: number = (reaction.count || 1) - 1;

      embedData[4 + offset] = line.split(': ')[0] + ': ' + amount;
      embed.setDescription(embedData.join('\n'));
      reaction.message.edit(' ', embed);
    });
  }
}

module.exports = (client: BotClient) => {
  return new afkListener(client);
};
