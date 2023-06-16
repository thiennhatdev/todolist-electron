const todoItemSchema = {
    type: 'object',
    properties: {
      filePath: {
        type: 'object',
      },
      title: {
        type: 'string',
      },
      content: {
        type: 'string',
      },
      secure: {
        type: 'string',
      },
      sendPlace: {
        type: 'string',
      },
      receiveDate: {
        type: 'number',
      },
      require: {
        type: 'string',
      },
      remind: {
        type: 'array',
      },
      approve: {
        type: 'string',
      },
      progress: {
        type: 'string',
      },
      searchKeyword: {
        type: 'string',
      },
      monthRemind: {
        type: 'string',
      },
      isDone: {
        type: 'boolean',
        default: false
      }
    },
};

module.exports = todoItemSchema;
