'use strict';

module.exports.hello = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'But could we have even LESS servers?',
        input: event,
      },
      null,
      2
    ),
  };
};