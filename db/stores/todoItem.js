const Datastore = require('nedb-promises');
const electron = require('electron');
const Ajv = require('ajv');
const todoItemSchema = require('../schemas/todoItem');
const { LIMIT } = require('./variables.js');
const path = require("path");
const moment = require('moment');

const app = electron.app;

class TodoItemStore {
    constructor() {
        const ajv = new Ajv({
            allErrors: true,
            useDefaults: true
        });

        this.schemaValidator = ajv.compile(todoItemSchema);
        // const dbPath = `${process.cwd()}/todolist.db`;
        // const dbPath = `${userData}/todolist.db`;
        // const dbPath = path.join(userData, 'todolist.db');
        const dbPath = path.join(app.getAppPath(), 'app', 'db', 'todolist.db');
        this.db = Datastore.create({
            filename: dbPath,
            timestampData: true,
            autoLoad: true,
            corruptAlertThreshold: 1
        });
        this.fromReceiveDateDefault = moment('01/01/1970', 'DD/MM/YYYY').valueOf();
        this.toReceiveDateDefault = moment('01/01/3000', 'DD/MM/YYYY').valueOf();

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

    readAll(objFilter, page, limit = LIMIT) {
        const { findName = '', secure = '', sendPlace = '', fromReceiveDate, toReceiveDate, monthRemind } = objFilter || {};
        const objDate = new Date();
        const currentYear = objDate.getFullYear();
        const monthAndYear = monthRemind ? `${monthRemind}/${currentYear}` : '';
        return this.db.find({
                receiveDate: { $gte: fromReceiveDate || this.fromReceiveDateDefault, $lte: toReceiveDate || this.toReceiveDateDefault },
                filterText: { $regex: new RegExp(`${findName}`) },  
                secure: { $regex: new RegExp(`${secure}`) },
                sendPlace: { $regex: new RegExp(`${sendPlace}`) },
                "remind.time": new RegExp(`${monthAndYear}`)
            })
                .sort({ createdAt: -1 })
                .skip(page * limit - limit)
                .limit(limit);
    }

    readActive() {
        return this.db.find({isDone: false}).exec();
    }

    archive(_id, data) {
        return this.db.update({_id}, {$set: data})
    }

    totalRecord(objFilter) {
        const { findName = '', secure = '', sendPlace = '', fromReceiveDate, toReceiveDate, monthRemind } = objFilter || {};
        const objDate = new Date();
        const currentYear = objDate.getFullYear();
        const monthAndYear = monthRemind ? `${monthRemind}/${currentYear}` : '';
        return this.db.count({ 
            receiveDate: { $gte: fromReceiveDate || this.fromReceiveDateDefault, $lte: toReceiveDate || this.toReceiveDateDefault },
            filterText: { $regex: new RegExp(`${findName}`) },
            secure: { $regex: new RegExp(`${secure}`) },
            sendPlace: { $regex: new RegExp(`${sendPlace}`) },
            "remind.time": new RegExp(`${monthAndYear}`)
        });
    }

    delete(_id) {
        return this.db.remove({_id});
    }

    remind(dateList) {
        const query = dateList.map(item => ({
            "remind.time": item
        }))
        return this.db.find(
            {        
                $or: query
            }
        )
    }
}

module.exports = new TodoItemStore();