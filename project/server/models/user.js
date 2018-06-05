const mongoose = require('mongoose')
const bcrypt = require('bcrypt-as-promised')

const { Schema } = mongoose

const User = new Schema({
    id: {
        type: Number,
        required: true,
        index: true,
        unique: true,
    },
    name: {
        type: String,
        index: true,
        unique: true,
        required: true,
    },
    hashedPassword: {
        type: String,
        required: true,
    }
})

User.methods = {
    async comparePassword(password) {
        try {
            const equals = await bcrypt.compare(password, this.hashedPassword)
            return equals
        } catch (err) {
            throw new Error('Incorrect data')
        }
    }
}

User.statics = {
    async get(findQuery) {
        const user = await this.findOne(findQuery)
        if (user) return user
    },

    async register(user) {
        const check = await this.findOne({ name: user.name })
        if (check) throw new Error('User already exists')

        const userID = await this.findOne().sort({ id: -1 }).exec()
        const salt = await bcrypt.genSalt()

        const newUser = new this({
            id: userID ? userID.id + 1 : 0,
            name: user.name,
            hashedPassword: await bcrypt.hash(user.password, salt),
        })

        await newUser.save()
        return newUser
    }
}

module.exports = mongoose.model('User', User)