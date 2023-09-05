const { Client, GatewayIntentBits } = require("discord.js");
// const { User, Users } = require("./classes");
const fs = require("fs/promises");
// const { Sequelize } = require("sequelize");
const User = require("./db.js");

// const registeredUsers = new Users();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});
const deleteUser = new Map();
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
            return;
        }
        const newUser = await User.create({
            id: author.id,
            username: author.username,
            globalName: author.globalName,
            balance: 0,
            canWork: 0,
            job: null,
            level: 0,
            exp: 0,
            stamina: 100,
            isAlive: true,
            isAdmin: false,
        });
        newUser.passiveStaminaDrain();
        message.channel.send(
            `Bem vindo, ${author.globalName}! Sua jornada começa agora!`
        );
        return;
    }
    if (content === "!ajuda") {
        message.reply(
            `Olá ${author.globalName}! Aqui está a lista de comandos disponiveis:\n!iniciar carreira - É o primeiro comando que você precisa usar ou o último se o F bateu na sua porta\n!estudar - Nada melhor do que conseguir mais conhecimento. Exemplo: "!estudar [numero de 1 a 18]"\n!enviar curriculo - Te da a chance de conseguir um emprego\n!trabalhar - Se você conseguiu um emprego agora pode usar este comando para juntar algun kwanzas.\n!descansar - Caso não queira ir de F recomendo que use este comando! Quando tiver 100 kwanzas ou mais\n!transferir - Que tal emprestar alguns kwanzas para seus amigos ? Não se esqueça de cobrar os juros na devolução. Exemplo: "!transferir [nome] [valor]"\n!apostar - Aposte seus kwanzas e ganhe kwanzas! Exemplo: "!apostar [valor] [número de 1 a 10]\n!promoção - Quando você possuir experiência suficiente no seu trabalho, você pode pedir uma promoção! Nem sempre funciona\n!demitir-se - Pois é... conseguir uma promoção não é tão simples, as vezes procurar novas oportunidades é a melhor opção!\n!informações - Vai mostrar as coisas relevantes do seu perfil, principalmente seu tempo de vid... quer dizer sua energia\n!ajuda - Bom... acredito que ja conheça este comando!\nDe forma simples e rápida, após iniciar uma carreira, você terá uma quantidade de energia que pode ser vista com o “!informações”. Não deixe que ela chegue a zero. Acho que não preciso explicar o que acontece. Você perde energia sempre que passa uma certa quantidade de tempo, também perde energia quando trabalha, procura um emprego ou estuda. Encontre um emprego o mais rápido possível para que possa juntar kwanzas e então use-os para descansar, assim irá recuperar sua energia. Quando estuda você consegue experiência, oque te aproxima do emprego. Quando estiver empregado você pode tentar ser promovido ou se demitir e procurar um novo emprego, lembrando que se não tiver a experiência necessária, você não pode ser promovido.\nAcho que é tudo.\nBoa Sorte!!`
        );
        return;
    }
    if (content.startsWith("!") && !user) {
        message.channel.send(
            `Você ainda não iniciou uma carreira! Para mais informações utilize !ajuda`
        );
        return;
    }

    if (content.startsWith("!") && !user.isAlive) {
        if (content === "!pix") {
            if (deleteUser.has(author.id)) {
                message.channel.send(
                    `Parece que você não entendeu quando disse para não usar mais esse comando! Sinta-se livre para recomeçar sua jornada!`
                );
                deleteUser.delete(author.id);
                user.destroy();
                return;
            }
            message.channel.send(
                `Parece que o desenvolvedor não acreditou que você chegaria até aqui!\nSe realmente deseja fazer isso, pode procurar pelo Oxford! 🙂👍\nComo possuo um bom coração aqui está uma nova chance! Você foi revivido e sua energia foi restaurada, lembre-se de nunca mais usar esse comando ☠️☠️☠️`
            );
            deleteUser.set(author.id, user);
            user.restoreStamina(true);
            user.setIsAlive();
            return;
        }
        message.channel.send(
            `Nem tudo são flores, e como estavamos no hardcore não é possivel recomeçar! Ou quem sabe um "!pix" possa resolver esse problema!`
        );
        return;
    }
    if (content === "!enviar curriculo" && !user.job) {
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
            return;
        }
        message.channel.send(`Não foi dessa vez! Tente novamente mais tarde!`);
    }
    if (content === "!trabalhar") {
        if (!user.job) {
            message.channel.send(
                `Você não tem uma profissão!\nUtilize "!enviar curriculo" para concorrer a uma vaga.`
            );
            return;
        }
        const result = user.work();

        if (result) {
            message.channel.send(
                `Você trabalhou e ganhou ${result.payment} kwanzas!`
            );
            return;
        }
        message.channel.send(`Você já trabalhou demais, descance um pouco!`);
        return;
    }
    if (content === "!informações") {
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
            } / 100\nEnergia: ${infos.stamina}\nEstá vivo: ${
                infos.isAlive ? "Sim" : "Não"
            }
            `
        );
        return;
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
        return;
    }
    if (content === "!promoção") {
        if (!user.job) {
            message.channel.send(`Você não está empregado para ser promovido!`);
            return;
        }
        const result = user.promotion();
        if (result.result) {
            message.channel.send(
                `Parabéns ${result.name} você foi promovido! Seu novo cargo é ${result.jobs.job} e seu salário será de ${result.jobs.payment} kwanzas!`
            );
            return;
        }
        message.channel.send(
            `Parece que não foi dessa vez! Quem sabe se você procurar novas oportunidades em outro lugar.`
        );
        return;
    }
    if (content === "!demitir-se" && user.job) {
        user.resign();
        message.channel.send(
            `Você desistiu da sua vaga para buscar novas oportunidades!`
        );
        return;
    }

    try {
        if (content.startsWith("!transferir")) {
            const [, nameTargetUser, getValue] = content.split(" ");
            const value = +getValue;
            if (!nameTargetUser || !value)
                throw new Error("Nome do destino ou valor inválido");
            let targetUser = await User.findOne({
                where: { globalName: nameTargetUser },
            });
            if (!targetUser) {
                targetUser = await User.findOne({
                    where: { username: nameTargetUser },
                });
                if (!targetUser) {
                    message.channel.send(`Usuário não encontrado!.`);
                    return;
                }
            }
            if (targetUser && user.balance >= value) {
                user.transfer(value, targetUser);
                message.channel.send(
                    `Você transferiu ${value} kwanzas para ${targetUser.globalName}!`
                );
                return;
            }
            message.channel.send(
                "Você não tem kwanzas suficientes ou o destinatario não existe"
            );
            return;
        }
        if (content.startsWith("!apostar")) {
            const [, getValue, getNumber] = content.split(" ");
            const value = +getValue;
            const number = +getNumber;
            if (!value || !number) throw new Error("Valor ou número inválido");
            const results = user.bet(value, number);
            if (results.balance < value) {
                message.channel.send(
                    `Você não possui kwanzas suficientes para apostar. Seu saldo atual é ${results.balance} kwanzas.`
                );
                return;
            }
            if (results.result) {
                message.channel.send(
                    `Você apostou ${value} kwanzas no número ${number} e ganhou ${
                        results.amount * number
                    } kwanzas!`
                );
                if (results.lucky)
                    message.channel.send(
                        `Parabéns sua vitória fez com que você recuperasse sua energia!`
                    );
                return;
            }
            message.channel.send(
                `Você apostou ${value} kwanzas no número ${number} e perdeu ${results.amount} kwanzas!`
            );
            if (results.unlucky)
                message.channel.send(
                    `Por causa da sua derrota você perdeu ${number} de energia!`
                );
            return;
        }
        if (content.startsWith("!estudar")) {
            const [, getStudyHours] = content.split(" ");
            const studyHours = +getStudyHours;
            if (!studyHours) throw new Error("tempo de estudo inválido");
            const result = user.study(studyHours);
            message.channel.send(
                `Você estudou por ${studyHours} horas! perdeu ${result.lostStamina} de energia e ganhou ${result.expGain} de experiência`
            );
            return;
        }
    } catch (e) {
        const arrayLogs = [];
        await fs
            .readFile(`${__dirname}/errorLogs.json`)
            .then((data) => {
                JSON.parse(data).forEach((log) => {
                    arrayLogs.push(log);
                });
            })
            .catch((e) => {
                console.error(e);
            });
        const newErrorLog = {
            id: author.id,
            username: author.username,
            globalName: author.globalName,
            content,
            date:
                new Date().toLocaleDateString("pt-BR") +
                " " +
                new Date().toLocaleTimeString("pt-BR"),
            error: e.message.toString(),
        };

        arrayLogs.push(newErrorLog);

        await fs.writeFile(
            `${__dirname}/errorLogs.json`,
            JSON.stringify(arrayLogs),
            (err) => {
                if (err) console.error(err);
            }
        );
        message.channel.send(
            `Parece que algo deu errado! Utilize !ajuda para mais informações.`
        );
    }
});
client.on("messageCreate", async (message) => {
    const content = message.content;
    const author = message.author;
    const user = await User.findByPk(author.id);
    if (content.startsWith("!set") && user.isAdmin === false) {
        message.channel.send(
            `Calma lá meu patrão! Esses comandos são apenas para a realeza!`
        );
        return;
    }
    try {
        if (content.startsWith("!setLevel")) {
            const [, getTargetUser, getLevel] = content.split(" ");
            const targetUser = await User.findOne({
                where: { globalName: getTargetUser },
            });
            const level = +getLevel;
            targetUser.setLevel(level);
            message.channel.send(
                `O nível de ${targetUser.globalName} foi setado para ${level}`
            );
            return;
        }
        if (content.startsWith("!setExp")) {
            const [, getTargetUser, getExp] = content.split(" ");
            const targetUser = await User.findOne({
                where: { globalName: getTargetUser },
            });
            const exp = +getExp;
            targetUser.setExp(exp);
            message.channel.send(
                `O exp de ${targetUser.globalName} foi setado para ${exp}`
            );
            return;
        }
        if (content.startsWith("!setBalance")) {
            const [, getTargetUser, getBalance] = content.split(" ");
            const targetUser = await User.findOne({
                where: { globalName: getTargetUser },
            });
            const balance = +getBalance;
            targetUser.setBalance(balance);
            message.channel.send(
                `O saldo de ${targetUser.globalName} foi setado para ${balance}`
            );
            return;
        }
        // if (content.startsWith("!setJob") && user.isAdmin) {
        //     const [, getTargetUser, getJob] = content.split(" ");
        //     const targetUser = await User.findOne({
        //         where: { globalName: getTargetUser },
        //     });
        //     targetUser.setJob(getJob);
        //     message.channel.send(
        //         `A profissão de ${targetUser.globalName} foi setada para ${getJob}`
        //     );
        // }
        if (content.startsWith("!setCanWork")) {
            const [, getTargetUser] = content.split(" ");
            const targetUser = await User.findOne({
                where: { globalName: getTargetUser },
            });
            targetUser.setCanWork();
            message.channel.send(
                `Os tempos de espera de ${targetUser.globalName} foram resetados.`
            );
            return;
        }
        if (content.startsWith("!setIsAdmin")) {
            const [, getTargetUser] = content.split(" ");
            const targetUser = await User.findOne({
                where: { globalName: getTargetUser },
            });
            targetUser.isAdmin();
            const isAdmin = targetUser.isAdmin;
            message.channel.send(
                `O usuário ${targetUser.globalName} ${
                    isAdmin ? "é" : "não é"
                } um administrador!`
            );
            return;
        }
        if (content.startsWith("!setStamina")) {
            const [, getTargetUser, getStamina] = content.split(" ");
            const targetUser = await User.findOne({
                where: { globalName: getTargetUser },
            });
            const stamina = +getStamina;
            targetUser.setStamina(stamina);
            message.channel.send(
                `A energia de ${targetUser.globalName} foi setada para ${stamina}`
            );
            return;
        }
        if (content.startsWith("!setIsAlive")) {
            const [, getTargetUser] = content.split(" ");
            const targetUser = await User.findOne({
                where: { globalName: getTargetUser },
            });
            targetUser.setIsAlive();
            const isAlive = targetUser.isAlive;
            message.channel.send(
                `${targetUser.globalName} ${isAlive ? "está vivo" : "foi de F"}`
            );
            return;
        }
    } catch (e) {
        const arrayLogs = [];
        await fs.readFile(`${__dirname}/errorLogs.json`).then((data) => {
            JSON.parse(data).forEach((log) => {
                arrayLogs.push(log);
            });
        });
        const newErrorLog = {
            id: author.id,
            username: author.username,
            globalName: author.globalName,
            content,
            date:
                new Date().toLocaleDateString("pt-BR") +
                " " +
                new Date().toLocaleTimeString("pt-BR"),
            error: e.message.toString(),
        };

        arrayLogs.push(newErrorLog);

        await fs.writeFile(
            `${__dirname}/errorLogs.json`,
            JSON.stringify(arrayLogs),
            (err) => {
                if (err) console.log(err);
            }
        );
        message.channel.send(
            `Parece que algo deu errado! Utilize !ajuda para mais informações.`
        );
    }
});

client.login("💀💀💀💀💀");
