
// Requiring the path module , used to handle the paths
const path = require('path');
// Requiring the typedefs
const InvalidKey = require('../errors/InvalidKey.js'),
    InvalidValue = require('../errors/InvalidValue.js'),
    InvalidFileFormat = require('../errors/InvalidFileFormat.js'),
    InitializingRequired = require('../errors/InitializingRequired.js'),
    NoResultsFound = require('../errors/NoResultsFound.js'),
    IllegalOperation = require('../errors/IllegalOperation.js');
// Requiring the fs module used to write , read and save changes
// This module is built-in
const fs = require('fs');

  /**
  * The UPJSON class , represents a database . All of it's methods are subject to the file system's errors.
  @todo Implement a path system to access/edit/write data
  */
class UPJSON_DB {
  /**
  * Create an UPJSON db
  @param {string} path - Path to the db
  @example
  * const { UPJSON } = require('UPJSON');
  * const db = new UPJSON('path/to/your/db');
  * // Creates your db
  */
  constructor (path = './data/db.json'){
    /**
    * The db's path
    @readonly
    @private
    */
    this.path = path;
  }


  /**
  * Initializes the db using the path you've given at the constructor . If the file is not present in that path , it creates one . Runs once in a db's life cycle
  @returns {boolean} The state of initializing , true if succesful
  @throws {InvalidFileFormat} An error , if the file is of wrong format
  */
  async init(){
    if(path.extname(this.path) !== '.json') throw new InvalidFileFormat('The file you\'ve specified a path to is of wrong type', {expected: '.json', recieved: path.extname(this.path)});
    if(!fs.existsSync(this.path)) fs.writeFileSync(this.path, JSON.stringify({}));
    const data = JSON.parse(fs.readFileSync(this.path));
    if(!data.initState) {
      data.initState = true;
      fs.writeFile(this.path , JSON.stringify(data) , (err) => {
        if(err) throw err;
      });
    }
    return data.initState;
  }


  /**
  * Sets data in the database to a key . Overwrites the value if exists
  @param {string} key - The key to set for
  @param {any} value - The value to set for
  @returns {JSON} The new data
  @throws {(InitializingRequired | InvalidKey | InvalidValue)}
  @example
  * // Set an empty array to a key named 'array'
  * db.set('array', []).catch(e => {console.error(e)});
  */
  async set(key , value){
    // Check if the key is given
    if(!key) throw new InvalidKey('Key not given.',{expected: 'string', recieved: null});
    // Check if the value is given
    if(!value) throw new InvalidValue('Value not given',{expected: 'any', recieved: null});
    // Checking if the init function was called before trying to proceed
    if(!this.initState) throw new InitializingRequired('Please Initialize the db to avoid errors.');
    // Cloning the data to a variable
    const data = JSON.parse(fs.readFileSync(this.path));
    // Attaching the key/value to the clone
    data[key] = value;
    // Writing to the json
    fs.writeFile(this.path , JSON.stringify(data) , (err) => {
      if(err) throw err;
    });
    // Return to the user
    return JSON.stringify(data);
  }

  /**
  * Gets a piece of data by its key
  @param {string} key - The key to get
  @returns {any} The value of that key
  @throws {(InitializingRequired | InvalidValue)}
  @example
  * // Getting a simple key value
  * db.get('array').then(r => {console.log(r)}).catch(e => {console.error(e)}); // Expected output : []
  */

  async get(key){
    // Check if the key is given
    if(!key) throw new InvalidKey('Key not given.',{expected: 'string', recieved: null});
    // Checking if the init function was called before trying to proceed
    if(!this.initState) throw new InitializingRequired('Please Initialize the db to avoid errors.');
    // Two variables holding our full data and the search results
    const data = JSON.parse(fs.readFileSync(this.path));
    // If the data holds a value by the given key , return it
    if (data[key]) return data[key];
    // Else send an error
    throw new NoResultsFound('No value was found.');
  }

  /**
  * Searches for keys in the db based on a function , the non strict version of {@link UPJSON_DB#get get()} . Behaves smillar to the built-in {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find Array.prototype.find()}
  @param {Object} searchOptions - Holds the search options if wanted
  @param {function} searchOptions.function - A function to apply on every piece of data untill it matches
  @param {boolean} searchOptions.findAll - Whether to return the full set of search results
  @returns {(Object[]|Object)} The result / results
  @throws {(InitializingRequired | NoResultsFound)}
  @example
  * // Getting all the keys with the length of 2
  * db.find({function: e => e.length == 2, findAll: true}).then(r => {console.log(r)}).catch(e => {console.error(e)}); // Expected output : [{key: 'number', value: 2020}]
  */
  async find(searchOptions){
    const data = JSON.parse(fs.readFileSync(this.path)),
      searchResults = [];
    if(!this.initState) throw new InitializingRequired('Please Initialize the db to avoid errors.');
    // Check if searchOptions were of good format
    if (!searchOptions || typeof searchOptions != 'object' || !searchOptions.function || typeof searchOptions.function != 'function' || typeof searchOptions.findAll != 'boolean') throw new Error('The searchOptions were of wrong format.');
    // Loop through the data
    for (let element in data) {
      // If the search function returns true on a set of data
      if(searchOptions.function(element)) {
        // If the user wants the first result , return it
        if(!searchOptions.findAll) return {key: element, value: data[element]};
        // If he wants the full search result , push to the searchResults array and continue looping
        searchResults.push({key: element, value: data[element]});
      }
    }
    // Check if the search results are less then one (no search results) and notify the user
    if(searchResults.length < 1) throw new NoResultsFound('Nothing passes your tests including your search function.');
    // Else , just return them
    return searchResults;
  }

  /**
  * Pushes a chunk of data to an array given a key . This uses strict search . If you want the search behaviour , refer to {@link UPJSON_DB#get find()} to retrieve the key
  @param {string} key - The key to set for
  @param {(any|array)} value - The value to set for . If its an array , the db performs a {@link https://www.w3schools.com/jsref/jsref_concat_array.asp concat}
  @returns {JSON} The new data
  @throws {(InitializingRequired | InvalidKey | InvalidValue | IllegalOperation)}
  @example
  * // Remember that array earlier ? We're going to populate it.
  * db.push('array' , 'apple').catch(e => {console.error(e)}); // Expected output : ['apple']
  * db.push('array' , ['orange' , 'banana']).catch(e => {console.error(e)}); // Expected output : ['apple' , 'orange' , 'banana']
  */
  async push(key , value){
    // Check if the key is given
    if(!key) throw new InvalidKey('Key not given.',{expected: 'string', recieved: null});
    // Check if the value is given
    if(!value) throw new InvalidValue('Value not given',{expected: 'any', recieved: null});
    // Checking if the init function was called before trying to proceed
    if(!this.initState) throw new InitializingRequired('Database not initialized.');
    // Two variables holding the full data and the cloned data
    const data = JSON.parse(fs.readFileSync(this.path)),
      baseArray = data[key];
    // Checking if the key actually exists
    if(!baseArray) throw new InvalidKey('Key doesn\'t exist on the db.', {expected: 'any', recieved: null});
    // Checking if the clone is an array
    if(!Array.isArray(baseArray)) throw new IllegalOperation('Cannot perform push operation on element of type '+typeof baseArray);
    // Pushing the value to the clone or concating it
    if(Array.isArray(value)) {
      const concatedArray = baseArray.concat(value);
      return this.set(key , concatedArray)
      .then(s => {return s})
      .catch(e => {throw e})
    } else {
      baseArray.push(value);
      return this.set(key , baseArray)
      .then(s => {return s})
      .catch(e => {throw e})
    }
  }

  /**
  * Adds an integer value to a value of a given key
  @param {string} key - The key to use .This uses strict search . If you want the search behaviour , refer to {@link UPJSON_DB#find find()} to retrieve the key
  @param {(string|number)} [value=1] - The value to add . If the value is of type string , the module tries to parse it and defaults to one if failed
  @returns {JSON} The new data
  @throws {(InitializingRequired | InvalidKey | IllegalOperation)}
  */
  async add(key , value){
    // Checking if the init function was called before trying to proceed
    if(!this.initState) throw new Error('Database not initialized.');
    // Cloning the key's value to a variable
    const data = JSON.parse(fs.readFileSync(this.path));
    // Check if the key is given
    if(!key) throw new InvalidKey('Key not given.',{expected: 'string', recieved: null});
    // Check if the type of the data is a number
    if(typeof data[key] != 'number') throw new IllegalOperation('The data you want to add to is of type '+typeof data+ ' . Only numbers allowed.');
    // Add a number to the data , the value or 1 (default)
    data[key] = data[key] + (parseInt(value) ? parseInt(value) : 1);
    // Write to the db
    fs.writeFile(this.path , JSON.stringify(data) , (err) => {
      if(err) throw err;
    });
    // Return to the user
    return data;
  }
  /**
  * Substracts an integer value to a value of a given key
  @param {string} key - The key to use .This uses strict search . If you want the search behaviour , refer to {@link UPJSON_DB#get get()} to retrieve the key
  @param {(string|number)} [value=1] - The value to substract . If the value is of type string , the module tries to parse it and defaults to one if failed
  @returns {JSON} The new data
  @throws {(InitializingRequired | InvalidKey | IllegalOperation)}
  */
  async substract(key , value){
    // Checking if the init function was called before trying to proceed
    if(!this.initState) throw new InitializingRequired('Please Initialize the db to avoid errors.');
    // Cloning the key's value to a variable
    const data = JSON.parse(fs.readFileSync(this.path));
    // Check if the key is given
    if(!key) throw new InvalidKey('Key not given.',{expected: 'string', recieved: null});
    // Check if the type of the data is a number
    if(typeof data[key] != 'number') throw new IllegalOperation('The data you want to substract to is of type '+typeof data+ ' . Only numbers allowed.');
    // Substract a number to the data , the value or 1 (default)
    data[key] = data[key] + (parseInt(value) ? parseInt(value) : 1);
    // Write to the db
    fs.writeFile(this.path , JSON.stringify(data) , (err) => {
      if(err) throw err;
    });
    // Return to the user
    return data;
  }

  /**
  * Deletes a key's value from the db . This is IRREVERSIBLE!
  @param {string} key - The key to delete its value
  @returns {JSON} New data
  @throws {(InitializingRequired|InvalidKey|InvalidValue)}
  */
  async delete(key){
    // Checking if the init function was called before trying to proceed
    if(!this.initState) throw new InitializingRequired('Please Initialize the db to avoid errors.');
    // Cloning the data into a variable
    const data = JSON.parse(fs.readFileSync(this.path));
    // Checking if the key is given
    if(!key) throw new InvalidKey('Key not given.',{expected: 'string', recieved: null});
    // Checking if the key exists
    if(!data[key]) throw new InvalidKey('Key does not exist.',{expected: 'string', recieved: null});
    // Deleting the key's value from the clone
    delete data[key];
    // Reseting the data
    fs.writeFile(this.path , JSON.stringify(data) , (err) => {
      if(err) throw err;
    });
    // Return to the user
    return data;
  }

  /**
  * Clears the database entirely . This is IRREVERSIBLE!
  @returns {boolean} Always true , meaning the db was completely cleared
  @throws {InitializingRequired}
  **/
  async clear(){
    // Checking if the init function was called before trying to proceed
    if(!this.initState) throw new InitializingRequired('Please Initialize the db to avoid errors.');
    // Write an empty object to the db
    fs.writeFile(this.path , JSON.stringify({}) , (err) => {
      if(err) throw err;
    });
    // Return to the user
    return true;
  }

  /**
  * Gets all the keys in the db
  @returns {string[]} The full array of keys
  @throws {InitializingRequired}
  */
  async keys(){
    // Checking if the init function was called before trying to proceed
    if(!this.initState) throw new InitializingRequired('Please Initialize the db to avoid errors.');
    // Cloning the data into a variable
    const data = JSON.parse(fs.readFileSync(this.path));
    // Returning the keys
    return Object.keys(data);
  }

  /**
  * Gets all the values in the db
  @returns {any[]} The full array of values
  @throws {InitializingRequired}
  */
  async values(){
    // Checking if the init function was called before trying to proceed
    if(!this.initState) throw new InitializingRequired('Please Initialize the db to avoid errors.');
    // Cloning the data into a variable
    const data = JSON.parse(fs.readFileSync(this.path));
    // Returning the values
    return Object.keys(data).map(key => data[key]);
  }

  /**
  * Gets everything stored in the db . Combines {@link UPJSON_DB#keys keys()} and {@link UPJSON_DB#values values()} . You can also achieve the same result using the {@link UPJSON_DB#find find()} method passing a function that returns a constant of true.
  @returns {Object[]} The full array of objects , holds the key and the value
  @throws {InitializingRequired}
  */
  async all(){
    // Checking if the init function was called before trying to proceed
    if(!this.initState) throw new InitializingRequired('Please Initialize the db to avoid errors.');
    // Cloning the data into a variable
    const data = JSON.parse(fs.readFileSync(this.path));
    // Returning the result
    return Object.keys(data).map(key => {
      const all = {};
      all.key = key;
      all.value = data[key];
      return all;
    });
  }

  /**
  * Checks if a key exists in a db
  @param {string} key - The key to check for
  @returns {boolean} The existence of the key
  @throws {(InitializingRequired | InvalidKey)}
  */
  async has(key){
    // Checking if the init function was called before trying to proceed
    if(!this.initState) throw new InitializingRequired('Please Initialize the db to avoid errors.');
    // Cloning the data into a variable
    const data = JSON.parse(fs.readFileSync(this.path));
    // Checking if the key is given
    if(!key) throw new InvalidKey('Key not given.',{expected: 'string', recieved: null});
    // Returning the existence boolean
    if(data[key]) return true;
    return false;
  }

  /**
  * Ensure that a key exists and has a value in the db . Combines {@link UPJSON_DB#has has()} and {@link UPJSON_DB#set set()}.
  @param {string} key - The key to check for
  @param {any} value - The value to set for if the check fails
  @returns {(boolean|JSON)} True if a key already exists . Otherwhise , return the new data
  @throws {(InitializingRequired | InvalidKey | InvalidValue)}
  */
  async ensure(key, value){
    // Checking if the value exists and storing it in a variable
    const state = await this.has(key);
    // If the key exists , inform the user
    if(state){
      return state;
    }
    // Else , set it in the db
    else {
      if(!value) throw new InvalidValue('The key does not exist but no value was given.', {expected: 'any', recieved: null});
      return this.set(key, value)
        .then(s => {
          return s;
        })
        .catch(e => {
          throw e;
        })
    }
  }

  /**
  * Filters an array by removing the items that fail that test
  @param {string} key - The key to edit its value
  @param {Object=} searchOptions - Contains the search options to use if you chose so . Identical to {@link UPJSON_DB#find find()} searchOptions
  @param {function} searchOptions.function - A function to apply on every piece of data untill it matches
  @param {boolean} searchOptions.findAll - Whether to remove the full set of search results
  @returns {JSON} The new set of data
  @throws {(InitializingRequired | InvalidKey | InvalidValue | IllegalOperation)}
  */
  async filter(key , searchOptions){
    const data = JSON.parse(fs.readFileSync(this.path)),
      searchResults = [];
    if(!this.initState) throw new InitializingRequired('Please Initialize the db to avoid errors.');
    if(!key) throw new InvalidKey('No key was given');
    if(!data[key]) throw new InvalidKey('No match to your key was found');
    if (!searchOptions || typeof searchOptions != 'object' || !searchOptions.function || typeof searchOptions.function != 'function' || typeof searchOptions.findAll != 'boolean') throw new Error('The searchOptions were of wrong format.');
    data[key] = data[key].filter(searchOptions.function);
    fs.writeFile(this.path, JSON.stringify(data) , (err) => {
      if(err) throw err;
    });
    return data;
  }

  /**
  * Gets the current initializing state
  */
  get initState(){
    return (JSON.parse(fs.readFileSync(this.path))).initState;
  }

  /**
  * Get the total number if key/value elements in the db
  @returns {number} - Total number of key/value elements in the db
  @throws {InitializingRequired}
  */
  async count(){
    return (Object.keys(JSON.parse(fs.readFileSync(this.path))).length) - 1;
  }
}


// Exporting the class
module.exports = UPJSON_DB;
