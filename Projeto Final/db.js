const { Sequelize, DataTypes, Model, where } = require("sequelize");
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
    time() {
        setInterval(() => {
            if (this.stamina <= 0) {
                this.update({
                    isAlive: false,
                });
                clearInterval(this.time);
            }
            this.update({
                stamina: this.stamina - 10,
            });
        }, 600_000);
    }
    work() {
        const { job, payment } = User.jobs(this.level);
        if (this.job !== job) {
            this.update({
                job: undefined,
            });
            return "demitido";
        }
        if (this.canWork + 300_000 <= Date.now()) {
            this.update({
                balance: this.balance + payment,
                canWork: Date.now(),
                stamina: this.stamina - 10,
            });
            this.levelUp();
            this.hasStamina();
            return true;
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
        if (randomNumber === number) {
            this.update({
                balance: this.balance + amount * number,
            });

            return {
                result: true,
                amount,
                balance: this.balance,
            };
        } else {
            this.update({
                balance: this.balance - amount,
            });

            return {
                result: false,
                amount,
                balance: this.balance,
            };
        }
    }
    restoreStamina() {
        if (this.balance >= 100) {
            this.update({
                stamina: 100,
                balance: this.balance - 100,
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
            this.update({
                job: job.job,
            });
            return {
                result: true,
                job: job.job,
                payment: job.payment,
            };
        }
        this.update({
            canWork: Date.now(),
        });
        return false;
    }
    levelUp() {
        this.update({
            exp: this.exp + 5,
        });
        if (this.exp >= 100) {
            this.update({
                level: this.level + 1,
                exp: this.exp - 100,
            });
        }
    }
    hasStamina() {
        if (this.stamina <= 0) {
            this.time();
        }
    }
    get infos() {
        return {
            globalName: this.globalName,
            balance: this.balance,
            canWork: this.canWork + 20_000 <= Date.now(),
            job: this.job,
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
    setJob(job) {
        this.update({
            job,
        });
    }
    setBalance(balance) {
        this.update({
            balance,
        });
    }
    setCanWork() {
        this.update({
            canWork: this.canWork - 100_000,
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
            user.time();
        });
    } catch (error) {
        console.error("Unable to connect to the database:", error);
    }
})();
module.exports = {
    User,
};
