const { Sequelize, DataTypes, Model } = require("sequelize");
const db = new Sequelize("database", "user", "password", {
    host: "localhost",
    dialect: "sqlite",
    logging: false,
    storage: __dirname + "/database.sqlite",
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
                name: DataTypes.STRING,
                balance: DataTypes.INTEGER,
                canWork: DataTypes.INTEGER,
                isAdmin: DataTypes.BOOLEAN,
            },
            {
                sequelize,
                tableName: "users",
            }
        );
        return this;
    }
    async work(amount) {
        if (this.canWork + 5000 <= Date.now()) {
            this.update({
                balance: this.balance + amount,
                canWork: Date.now(),
            });
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
    get userInfos() {
        return {
            name: this.name,
            balance: this.balance,
        };
    }
}
(async () => {
    try {
        await db.authenticate();
        console.log("Connection has been established successfully.");
        User.init(db);
        await User.sync();
    } catch (error) {
        console.error("Unable to connect to the database:", error);
    }
})();
module.exports = {
    User,
    db,
};
