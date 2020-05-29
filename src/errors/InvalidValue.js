/**
* An error class that indicates an invalid value
@extends Error
*/

class InvalidValue extends Error {
  constructor(message , options){
    super(`${message}. \n Expected: ${options.expected}. \n Recieved: ${options.recieved}.`);
  }
}

module.exports = InvalidValue;
