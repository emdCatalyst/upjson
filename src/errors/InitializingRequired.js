
/**
* An error class that gets triggered when performing an action on the db without initializing it
@extends Error
*/

class InitializingRequired extends Error {
  constructor(message){
    super(`${message}.`);
  }
}

module.exports = InitializingRequired;
