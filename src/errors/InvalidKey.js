
/**
* An error class that indicates providing an invalid key
@extends Error
*/

class InvalidKey extends Error {
  constructor(message , options){
    super(`${message}. \n Expected: ${options.expected}. \n Recieved: ${options.recieved}.`);
  }
}

module.exports = InvalidKey;
