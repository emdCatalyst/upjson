/**
* An error class that indicates a non existing value / values in the db (Usually gets thrown when {@link UPJSON#find find()} / {@link UPJSON#get get()} comes up with nothin)
@extends Error
*/

class NoResultsFound extends Error {
  constructor(message){
    super(`${message}.`);
  }
}

module.exports = NoResultsFound;
