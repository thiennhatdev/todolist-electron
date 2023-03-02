const Datastore = require('nedb-promises');
const Ajv = require('ajv');
const todoItemSchema = require('../schemas/todoItem');
const { LIMIT } = require('../../utils/contants');

class TodoItemStore {
    constructor() {
        const ajv = new Ajv({
            allErrors: true,
            useDefaults: true
        });

        this.schemaValidator = ajv.compile(todoItemSchema);
        const dbPath = `${process.cwd()}/todolist.db`;
        this.db = Datastore.create({
            filename: dbPath,
            timestampData: true,
        });
    }

    validate(data) {
        return this.schemaValidator(data);
    }

    create(data) {
        const isValid = this.validate(data);
        if (isValid) {
            return this.db.insert(data);
        }
    }

    read(_id) {
        return this.db.findOne({_id}).exec()
    }

    readAll(text, page, limit = LIMIT) {
        return this.db.find({ $or: [
                    {
                        title: { $regex: new RegExp(`${text}`) }
                    },
                    {
                        content: { $regex: new RegExp(`${text}`) }
                    },
                    {
                        searchKeyword: { $regex: new RegExp(`${text}`) }
                    }
                ]})
                .skip(page * limit - limit)
                .limit(limit);
    }

    readActive() {
        return this.db.find({isDone: false}).exec();
    }

    archive(_id, data) {
        return this.db.update({_id}, {$set: data})
    }

    filter(text) {
        return this.db.find({ content: { $regex: new RegExp(`${text}`) } }).skip(3).limit(3)
    }

    totalRecord(text) {
        return this.db.count({ content: { $regex: new RegExp(`${text}`) } }).then(res => res);
    }

    delete(_id) {
        return this.db.remove({_id});
    }
}

module.exports = new TodoItemStore();