
/**
* An error class that indicates a wrong file format
@extends Error
*/

class InvalidFileFormat extends Error {
  constructor(message , options){
    super(`${message}. \n Expected: ${options.expected}. \n Recieved: ${options.recieved}.`);
  }
}

module.exports = InvalidFileFormat;
