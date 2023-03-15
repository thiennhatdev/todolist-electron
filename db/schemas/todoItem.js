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
        type: 'string',
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
      isDone: {
        type: 'boolean',
        default: false
      },
      filterText: {
        type: "string"
      }
    },
};

module.exports = todoItemSchema;
