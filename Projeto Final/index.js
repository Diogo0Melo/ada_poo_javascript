const { Client, GatewayIntentBits } = require("discord.js");
// const { User, Users } = require("./classes");
// const fs = require("fs");
// const { Sequelize, DataTypes, Model } = require("sequelize");
const { User } = require("./db.js");

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
    const content = message.content;
    const author = message.author;
    const user = await User.findByPk(author.id);
    if (content === "!iniciar carreira") {
        if (user) {
            message.channel.send(`Você já iniciou uma carreira!`);
        } else {
            const newUser = await User.create({
                id: author.id,
                username: author.username,
                globalName: author.globalName,
                balance: 0,
                canWork: Date.now(),
                job: undefined,
                level: 0,
                exp: 0,
                stamina: 100,
                isAlive: true,
                isAdmin: false,
            });
            newUser.time();
            message.channel.send(
                `Bem vindo, ${author.globalName}! Sua jornada começa agora!`
            );
        }
    }
    if (content === "!enviar curriculo" && user && !user.job) {
        const result = user.findJob();
        if (result === "cooldown") {
            message.channel.send(
                `Não há vagas disponiveis! Aguarde alguns minutos.`
            );
            return;
        }
        if (result) {
            message.channel.send(
                `Parabéns você conseguiu uma vaga como ${result.job} e receberá ${result.payment} kwanzas!`
            );
        } else {
            message.channel.send(
                `Não foi dessa vez! Tente novamente mais tarde!`
            );
        }
    }
    if (content === "!trabalhar" && user) {
        if (!user.job) {
            message.channel.send(
                `Você não tem uma profissão!\nUtilize "!enviar curriculo" para concorrer a uma vaga.`
            );
            return;
        }
        const job = user.work();
        if (job === "demitido") {
            message.channel.send(
                `Está na hora de procurar novas oportunidades! Você deixou sua vaga atual!`
            );
        } else if (job) {
            message.channel.send(`Você trabalhou e ganhou 100 kwanzas!`);
        } else {
            message.channel.send(
                `Você já trabalhou demais, descance um pouco!`
            );
        }
        return;
    }
    if (content.includes("!transferir") && user) {
        const [, nameTargetUser, getValue] = content.split(" ");
        if (!nameTargetUser || !getValue) {
            message.channel.send(
                "Usuário ou valor inválido. Utilize !ajuda para mais informações."
            );
            return;
        }
        const value = +getValue;
        let targetUser = await User.findOne({
            where: { globalName: nameTargetUser },
        });
        if (!targetUser) {
            targetUser = await User.findOne({
                where: { username: nameTargetUser },
            });
        }
        if (targetUser && user.balance >= value) {
            user.transfer(value, targetUser);
            message.channel.send(
                `Você transferiu ${value} kwanzas para ${targetUser.globalName}!`
            );
        } else {
            message.channel.send(
                "Você não tem dinheiro suficiente ou o destinatario não existe"
            );
        }
    }
    if (content.includes("!apostar") && user) {
        const [, getValue, getNumber] = content.split(" ");
        if (!getValue || !getNumber) {
            message.channel.send(
                "Valor ou número inválido. Utilize !ajuda para mais informações."
            );
            return;
        }
        const value = +getValue;
        const number = +getNumber;
        const results = user.bet(value, number);
        if (results.balance < value) {
            message.channel.send(
                `Você não possui kwanzas suficientes para apostar. Seu saldo atual é ${results.balance} kwanzas.`
            );
            return;
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
    // if (content === "!save" && user.isAdmin) {
    //     fs.writeFileSync(
    //         `${__dirname}/database.json`,
    //         JSON.stringify(registeredUsers.saveUsers())
    //     );
    //     message.channel.send("Salvo com sucesso!");
    // }
    if (content === "!informações" && user) {
        const infos = user.infos;
        message.channel.send(
            `Olá, ${infos.globalName}!\nSuas informações são:\nSaldo: ${
                infos.balance
            } kwanzas\nPode Trabalhar: ${
                infos.canWork ? "Sim" : "Não"
            }\nProfissão: ${
                infos.job ? infos.job : "Você ainda não possui uma profissão"
            }\nNível: ${infos.level}\nExperiencia: ${
                infos.exp
            } / 100\nEnergia: ${infos.stamina}
            `
        );
    }
    if (content === "!descansar") {
        const result = user.restoreStamina();
        if (result) {
            message.channel.send(`Sua energia foi recuperada!`);
            return;
        }
        message.channel.send(
            `Você não tem kwanzas suficientes para descansar!`
        );
    }
});
client.on("messageCreate", async (message) => {
    const content = message.content;
    const author = message.author;
    const user = await User.findByPk(author.id);
    if (content.includes("!setLevel") && user.isAdmin) {
        const [, getTargetUser, getLevel] = content.split(" ");
        const targetUser = await User.findOne({
            where: { globalName: getTargetUser },
        });
        const level = +getLevel;
        targetUser.setLevel(level);
        message.channel.send(
            `O nível de ${targetUser.globalName} foi setado para ${level}`
        );
    }
    if (content.includes("!setExp") && user.isAdmin) {
        const [, getTargetUser, getExp] = content.split(" ");
        const targetUser = await User.findOne({
            where: { globalName: getTargetUser },
        });
        const exp = +getExp;
        targetUser.setExp(exp);
        message.channel.send(
            `O exp de ${targetUser.globalName} foi setado para ${exp}`
        );
    }
    if (content.includes("!setBalance") && user.isAdmin) {
        const [, getTargetUser, getBalance] = content.split(" ");
        const targetUser = await User.findOne({
            where: { globalName: getTargetUser },
        });
        const balance = +getBalance;
        targetUser.setBalance(balance);
        message.channel.send(
            `O saldo de ${targetUser.globalName} foi setado para ${balance}`
        );
    }
    if (content.includes("!setJob") && user.isAdmin) {
        const [, getTargetUser, getJob] = content.split(" ");
        const targetUser = await User.findOne({
            where: { globalName: getTargetUser },
        });
        const job = getJob;
        targetUser.setJob(job);
        message.channel.send(
            `A profissão de ${targetUser.globalName} foi setada para ${job}`
        );
    }
    if (content.includes("!setCanWork") && user.isAdmin) {
        const [, getTargetUser] = content.split(" ");
        const targetUser = await User.findOne({
            where: { globalName: getTargetUser },
        });
        targetUser.setCanWork();
        message.channel.send(
            `Os tempos de espera do ${targetUser.globalName} foram resetados.`
        );
    }
    if (content.includes("!isAdmin") && user.isAdmin) {
        const [, getTargetUser] = content.split(" ");
        const targetUser = await User.findOne({
            where: { globalName: getTargetUser },
        });
        message.channel.send(targetUser.isAdmin);
    }
    if (content.includes("!setStamina") && user.isAdmin) {
        const [, getTargetUser, getStamina] = content.split(" ");
        const targetUser = await User.findOne({
            where: { globalName: getTargetUser },
        });
        const stamina = +getStamina;
        targetUser.setStamina(stamina);
        message.channel.send(
            `A energia de ${targetUser.globalName} foi setada para ${stamina}`
        );
    }
});

client.login(
    "MTE0NzU2OTkyMTAyNzQ3MzU1OQ.GVmadc.pbiEvA6iwhsPRINeQTh47y2Vq1l9uZ8oq1jLt0"
);
