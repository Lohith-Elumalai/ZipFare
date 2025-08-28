class UserController {
    constructor() {
        this.users = [];
    }

    getUser(req, res) {
        const userId = req.params.id;
        const user = this.users.find(u => u.id === userId);
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    }

    createUser(req, res) {
        const newUser = {
            id: Date.now().toString(),
            ...req.body
        };
        this.users.push(newUser);
        res.status(201).json(newUser);
    }

    updateUser(req, res) {
        const userId = req.params.id;
        const userIndex = this.users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            this.users[userIndex] = { ...this.users[userIndex], ...req.body };
            res.status(200).json(this.users[userIndex]);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    }
}

export default UserController;