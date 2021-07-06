import * as Discord from 'discord.js';
import {BotClient} from '../../utils/BotClient';
import {Listener} from '../../utils/Listener';

export class verification extends Listener {
  role!: Discord.Role | null;

  constructor(client: BotClient) {
    super(client, {
      name: 'Verification',
      guild: '827311645427499059'
    });

    (async () => {
      var channel: Discord.TextChannel = <Discord.TextChannel>await client.channels.fetch('861007403104337940');
      channel.messages.fetch({ limit: 3 }, true);

      var guild = await client.guilds.fetch('860700731135492109');
      this.role = await guild.roles.fetch('860709836357369886');
    })();

    client.on('messageReactionAdd', async (reaction: Discord.MessageReaction, user: Discord.User | Discord.PartialUser) => {
      if (user.bot) return;
      if (reaction.message.channel.id != '861007403104337940') return;

      var guildMember: Discord.GuildMember | undefined = await reaction.message.guild?.members.fetch(user.id);
      if (guildMember == null) return;

      if (this.role != null) await guildMember.roles.add(this.role);

      reaction.users.remove(user.id);

      await reaction.users.fetch();
      if (reaction.users.cache.has('860700557031636992')) return;
      var react: Discord.GuildEmoji | Discord.ReactionEmoji = reaction.emoji;
      reaction.message.react(react);
    });
  }
}

module.exports = (client: BotClient) => {
  return new verification(client);
};
