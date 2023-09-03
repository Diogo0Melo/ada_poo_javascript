const { Client, GatewayIntentBits } = require("discord.js");
// const { User, Users } = require("./classes");
// const fs = require("fs");
// const { Sequelize, DataTypes, Model } = require("sequelize");
const { db, User } = require("./db.js");

// const registeredUsers = new Users();

// fs.readFile(`${__dirname}/database.json`, "utf8", (err, data) => {
//     if (err) throw err;
//     Array.prototype.forEach.call(JSON.parse(data), (user) => {
//         registeredUsers.addUser(user.id, user);
//     });
// });

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});
client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", async (message) => {
    const conteudo = message.content;
    const autor = message.author;
    const user = await User.findByPk(autor.id);
    if (conteudo === "!enviar curriculo") {
        if (user) {
            message.channel.send(`Você já está empregado!`);
        } else {
            await User.create({
                id: autor.id,
                name: autor.username,
                balance: 0,
                canWork: Date.now(),
                isAdmin: false,
            });
            message.channel.send(`Você foi contratado!`);
        }
    }
    if (conteudo === "!trabalhar" && user) {
        if (await user.work(100)) {
            message.channel.send(`Você trabalhou e ganhou 100 kwanzas!`);
        } else {
            message.channel.send(
                `Você já trabalhou demais, descance um pouco!`
            );
        }
    }
    if (conteudo.includes("!transferir") && user) {
        const [, nameTargetUser, getValue] = conteudo.split(" ");
        const targetUser = await User.findOne({
            where: { name: nameTargetUser },
        });
        const value = Number(getValue);
        if (targetUser && user.balance >= value) {
            user.transfer(value, targetUser);
            message.channel.send(
                `Você transferiu ${value} kwanzas para ${targetUser.name}`
            );
        } else {
            message.channel.send(
                "Você não tem dinheiro suficiente ou o destinatario não existe"
            );
        }
    }
    if (conteudo.includes("!apostar") && user) {
        const [, getValue, getNumber] = conteudo.split(" ");
        const value = Number(getValue);
        const number = Number(getNumber);
        const results = user.bet(value, number);
        if (results.balance < value) {
            message.channel.send(
                `Você não possui kwanzas suficientes para apostar. Seu saldo atual é ${results.balance} kwanzas.`
            );
        } else if (results.result) {
            message.channel.send(
                `Você apostou ${value} e ganhou ${
                    results.amount * number
                } kwanzas!`
            );
        } else {
            message.channel.send(
                `Você apostou ${value} e perdeu ${results.amount} kwanzas!`
            );
        }
    }
    // if (conteudo === "!save" && user.isAdmin) {
    //     fs.writeFileSync(
    //         `${__dirname}/database.json`,
    //         JSON.stringify(registeredUsers.saveUsers())
    //     );
    //     message.channel.send("Salvo com sucesso!");
    // }
});

client.login(
    "MTE0NzU2OTkyMTAyNzQ3MzU1OQ.GVmadc.pbiEvA6iwhsPRINeQTh47y2Vq1l9uZ8oq1jLt0"
);
