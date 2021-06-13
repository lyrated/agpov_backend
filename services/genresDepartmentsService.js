const Movie = require('../models/movie');
const { 
  combineCastAndCrew,
  convertDataArrayToObject
} = require('./utils');
const limit = 20000; // sample size
// const limit = 560000;

let aggregationBase = [
  {
    '$limit': limit
  }, {
    '$match': {
      'genres.0': {
        '$exists': true
      }
    }
  }, {
    '$unwind': {
      'path': '$genres',
      'preserveNullAndEmptyArrays': false
    }
  }, {
    '$unwind': {
      'path': '$cast',
      'preserveNullAndEmptyArrays': false
    }
  }, {
    '$match': {}
  }, {
    '$group': {
      '_id': '$genres.name',
      'count': {
        '$sum': 1
      }
    }
  }, {
    '$sort': {
      'count': -1
    }
  }
];

let getTotalParticipationByGenre = async () => {
  try {
    let aggregationTotal = aggregationBase;
    aggregationTotal[4]['$match'] = { 'cast.gender': { '$gt': 0, '$lt': 3 } };
    let cast = await Movie.aggregate(aggregationTotal);

    aggregationTotal[3]['$unwind']['path'] = '$crew';
    aggregationTotal[4]['$match'] = { 'crew.gender': { '$gt': 0, '$lt': 3 } };
    let crew = await Movie.aggregate(aggregationTotal);

    return {
      cast: cast,
      crew: crew
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}

module.exports = {
  getParticipationInGenres: async (gender, showOnly) => {
    try {
      let total;
      if (gender != 3) {
        total = await getTotalParticipationByGenre();

        if (showOnly == 'cast') {
          total = convertDataArrayToObject(total.cast);
        } else if (showOnly == 'crew') {
          total = convertDataArrayToObject(total.crew);
        } else {
          total = combineCastAndCrew(total.cast, total.crew);
        }
      }

      let aggregation = aggregationBase;

      if (gender == 1 || gender == 2 || gender == 3) {
        aggregation[3]['$unwind']['path'] = '$cast';
        aggregation[4]['$match'] = { 'cast.gender': gender };
      } else {
        return total;
      }

      // get data from cast/crew/both
      let cast, crew, combined;
      if (!showOnly || showOnly == 'cast') {
        cast = await Movie.aggregate(aggregation);
      }
      if (!showOnly || showOnly == 'crew') {
        aggregation[3]['$unwind']['path'] = '$crew';
        aggregation[4]['$match'] = { 'crew.gender': gender };
        crew = await Movie.aggregate(aggregation);
      }
      if (!showOnly) {
        combined = combineCastAndCrew(cast, crew);
      } else if (cast) {
        combined = convertDataArrayToObject(cast);
      } else if (crew) {
        combined = convertDataArrayToObject(crew);
      }

      // for non binary percentages are too low, return whole numbers
      if (gender == 3) {
        return combined;
      }

      // get percentages of each year
      let percentages = {};
      Object.keys(combined).forEach(key => {
        let p = combined[key] / total[key] * 100;
        percentages[key] = parseFloat(p.toFixed(2));
      })

      return percentages;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}