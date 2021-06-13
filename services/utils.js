module.exports = {
  // convert array from mongodb aggregations to object { _id: value }
  convertDataArrayToObject: (array) => {
    let obj = {};
    array.forEach(c => obj[c._id] = c.count);
    return obj;
  },

  // combine results from cast & crew aggregations
  // must be in format like: { '_id': 'Comedy', 'count': 123 }
  combineCastAndCrew: (cast, crew) => {
    let combined = {};
    cast.forEach(c => {
      if (typeof combined[c._id] !== 'undefined') {
        combined[c._id] += c.count;
      } else {
        combined[c._id] = c.count
      }
    });

    crew.forEach(c => {
      if (typeof combined[c._id] !== 'undefined') {
        combined[c._id] += c.count;
      } else {
        combined[c._id] = c.count
      }
    });

    return combined;
  }
}