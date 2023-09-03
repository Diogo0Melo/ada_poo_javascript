class User {
    constructor(id, name, balance = 0, canWork = Date.now(), isAdmin = false) {
        this.id = id;
        this.name = name;
        this.balance = balance;
        this.canWork = canWork;
        this.isAdmin = isAdmin;
    }
    work(amount) {
        if (this.canWork + 5000 <= Date.now()) {
            this.balance += amount;
            this.canWork = Date.now();
            return true;
        }
        return false;
    }
    transfer(amount, targetUser) {
        this.balance -= amount;
        targetUser.balance += amount;
    }
    bet(amount, number) {
        const randomNumber = Math.floor(Math.random() * 10 + 1);
        if (randomNumber === number) {
            this.balance += amount * number;
            return {
                result: true,
                amount,
                balance: this.balance,
            };
        } else {
            this.balance -= amount;
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
class Users extends Map {
    addUser(key, user) {
        const newUser = new User(
            user.id,
            user.name,
            user.balance,
            user.canWork,
            user.isAdmin
        );

        this.set(key, newUser);
    }
    find(callback) {
        let foundUser;
        this.forEach((user, key) => {
            const result = callback(user);
            if (result) {
                return (foundUser = key);
            }
        });
        return this.get(foundUser);
    }
    saveUsers() {
        const arrayUsers = [];

        for (const [key, value] of this) {
            const obj = {
                [key]: value,
            };
            arrayUsers.push(obj);
        }
        return arrayUsers;
    }
}

module.exports = {
    User,
    Users,
};
