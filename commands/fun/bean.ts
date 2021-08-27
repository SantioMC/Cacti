import { BotClient } from '../../utils/BotClient';
import { Command, ExecuteEvent, PermissionLevel } from '../../utils/Command';
import { GuildMember, Message, MessageEmbed } from 'discord.js';


class bean extends Command {
  constructor(client: BotClient) {
    super(client, {
      name: 'bean',
      description: 'Bean a member!',
      category: 'Fun',
      aliases: [],
      permissionLevel: PermissionLevel.Default,
      arguments: [
        {
          name: 'user',
          description: 'The user you want to bean',
          required: true,
          type: 'member'
        }
      ]
    });
  }

  execute = async (event: ExecuteEvent) => {
    var user: GuildMember = <GuildMember>event.arguments.shift();
    var bean = await event.message.channel.send(`Issuing Infraction...`)
    
    setTimeout(() => {
      bean.edit(``, new MessageEmbed()
      .setTitle(` `)
      .setDescription(`You have Successfully beaned ` + user.user.tag + `!`)
      .setColor("148b47")
      .setImage(`http://assets.stickpng.com/images/58afe049829958a978a4a6c0.png`))
  }, 850);
  };
}

module.exports = (client: BotClient) => {
  return new bean(client);
};
