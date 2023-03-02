const todoItemSchema = {
    type: 'object',
    properties: {
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
        type: 'string',
      },
      require: {
        type: 'string',
      },
      expiredDate: {
        type: 'string',
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
      isDone: {
        type: 'boolean',
        default: false
      }
    },
};

module.exports = todoItemSchema;
