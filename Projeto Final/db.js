const { Sequelize, DataTypes, Model } = require("sequelize");
const db = new Sequelize("database", "user", "password", {
    host: "localhost",
    dialect: "sqlite",
    logging: false,
    storage: `${__dirname}/database.sqlite`,
});

class User extends Model {
    static init(sequelize) {
        super.init(
            {
                id: {
                    type: DataTypes.STRING,
                    primaryKey: true,
                    allowNull: false,
                },
                username: DataTypes.STRING,
                globalName: DataTypes.STRING,
                balance: DataTypes.INTEGER,
                canWork: DataTypes.INTEGER,
                job: DataTypes.STRING,
                level: DataTypes.INTEGER,
                exp: DataTypes.INTEGER,
                stamina: DataTypes.INTEGER,
                isAlive: DataTypes.BOOLEAN,
                isAdmin: DataTypes.BOOLEAN,
            },
            {
                sequelize,
                tableName: "users",
            }
        );
        return this;
    }
    static jobs(level) {
        if (level <= 25) return { job: "Estágiario", payment: 100 };
        if (level <= 50) return { job: "Trainee", payment: 200 };
        if (level <= 75) return { job: "Junior", payment: 400 };
        if (level < 100) return { job: "Pleno", payment: 800 };
        return { job: "Senior", payment: 1600 };
    }
    passiveStaminaDrain() {
        const delayStaminaDrain = setInterval(() => {
            this.update({
                stamina: this.stamina - 10,
            });
            this.hasStamina;
        }, 600_000);
        return this.hasStamina(delayStaminaDrain);
    }
    work() {
        const { payment } = JSON.parse(this.job);
        if (this.canWork + 300_000 <= Date.now()) {
            this.update({
                balance: this.balance + payment,
                canWork: Date.now(),
                stamina: this.stamina - 10,
            });
            this.levelUp(10);
            this.hasStamina();
            return {
                result: true,
                payment,
                balance: this.balance,
            };
        }
        return false;
    }
    transfer(amount, targetUser) {
        if (amount <= this.balance) {
            this.update({
                balance: this.balance - amount,
            });
            targetUser.update({
                balance: targetUser.balance + amount,
            });
            return true;
        }
        return false;
    }
    bet(amount, number) {
        if (amount > this.balance) {
            return {
                result: false,
                amount,
                balance: this.balance,
            };
        }
        const randomNumber = Math.floor(Math.random() * 10 + 1);
        const randomNumber2 = Math.floor(Math.random() * 10 + 1);
        if (randomNumber === number) {
            this.update({
                balance: this.balance + amount * number,
            });

            const lucky =
                randomNumber2 === number ? this.restoreStamina() : null;

            return {
                result: true,
                amount,
                balance: this.balance,
                lucky,
            };
        } else {
            this.update({
                balance: this.balance - amount,
            });
            const unlucky = randomNumber2 === number;
            unlucky ? this.update({ stamina: this.stamina - number }) : null;
            return {
                result: false,
                amount,
                balance: this.balance,
                unlucky,
            };
        }
    }
    restoreStamina(freeRestore = false) {
        if (this.balance >= 100) {
            this.update({
                stamina: 100,
                balance: this.balance - 100,
            });
            return true;
        }
        if (freeRestore) {
            this.update({
                stamina: 100,
            });
            return true;
        }
        return false;
    }
    findJob() {
        const randomNumber = Math.floor(Math.random() * 100 - this.level);
        if (this.canWork + 300_000 > Date.now()) {
            return "cooldown";
        }
        if (randomNumber <= 0) {
            const job = User.jobs(this.level);
            const JSONjob = JSON.stringify(job);
            this.update({
                job: JSONjob,
            });
            return {
                result: true,
                job: job.job,
                payment: job.payment,
            };
        }
        this.update({
            canWork: Date.now(),
            stamina: this.stamina - 2,
        });
        this.hasStamina();
        return false;
    }
    async levelUp(exp) {
        this.update({
            exp: this.exp + exp,
        });
        if (this.exp >= 100) {
            while (this.exp >= 100) {
                await this.update({
                    level: this.level + 1,
                    exp: this.exp - 100,
                });
            }
        }
    }
    async hasStamina(delayStaminaDrain) {
        if (this.stamina <= 0) {
            await this.update({
                isAlive: false,
            });
            clearInterval(delayStaminaDrain);
        }
    }
    promotion() {
        try {
            var { job } = JSON.parse(this.job);
        } catch {}

        const jobs = User.jobs(this.level);
        const randomNumber = Math.floor(Math.random() * 100);
        if (job !== jobs.job && randomNumber === 50) {
            const newJob = JSON.stringify(jobs);
            this.update({
                job: newJob,
            });
            return {
                result: true,
                jobs,
                name: this.globalName,
            };
        }
        return false;
    }
    resign() {
        this.update({
            job: null,
        });
    }
    study(studyHours) {
        const randomNumber = Math.floor(Math.random() * 100 + 1);
        const randomNumber2 = Math.floor(Math.random() * 36 + 1 - studyHours);
        const lostStamina =
            randomNumber <= randomNumber2
                ? randomNumber2 - randomNumber
                : randomNumber - randomNumber2;
        const expGain = lostStamina * studyHours;
        this.update({
            stamina: this.stamina - lostStamina,
        });
        this.levelUp(expGain);
        this.hasStamina();
        return {
            result: true,
            expGain,
            lostStamina,
        };
    }
    get infos() {
        try {
            var { job } = JSON.parse(this.job);
        } catch {}
        return {
            globalName: this.globalName,
            balance: this.balance,
            canWork: this.canWork + 300_000 <= Date.now(),
            job,
            level: this.level,
            exp: this.exp,
            stamina: this.stamina,
            isAlive: this.isAlive,
        };
    }
    setLevel(level) {
        this.update({
            level,
        });
    }
    setExp(exp) {
        this.update({
            exp,
        });
    }
    // setJob(job) {
    //     this.update({
    //         job,
    //     });
    // }
    setBalance(balance) {
        this.update({
            balance,
        });
    }
    setCanWork() {
        this.update({
            canWork: 0,
        });
    }
    setStamina(stamina) {
        this.update({
            stamina,
        });
    }
    setIsAlive() {
        const isAlive = this.isAlive ? false : true;
        this.update({
            isAlive,
        });
    }
    setIsAdmin() {
        const isAdmin = this.isAdmin ? false : true;
        this.update({
            isAdmin,
        });
    }
}

(async () => {
    try {
        await db.authenticate();
        console.log("Connection has been established successfully.");
        User.init(db);
        await User.sync();
        const users = await User.findAll();
        users.forEach((user) => {
            user.passiveStaminaDrain();
        });
    } catch (error) {
        console.error("Unable to connect to the database:", error);
    }
})();

module.exports = User;
