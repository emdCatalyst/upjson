
/**
* An error class that gets triggered when performing an operation on a non accepted type element
@extends Error
*/

class IllegalOperation extends Error {
  constructor(message){
    super(`${message}.`);
  }
}

module.exports = IllegalOperation;
