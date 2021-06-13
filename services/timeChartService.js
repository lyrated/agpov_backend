const Movie = require('../models/movie');
const {
  convertDataArrayToObject,
  combineCastAndCrew
} = require('./utils');

let aggregationBase = [
  {
    '$limit': 555000
  }, {
    '$match': {
      'release_date': {
        '$nin': [
          null, ''
        ]
      }
    }
  }, {
    '$addFields': {
      'date': {
        '$convert': {
          'input': '$release_date',
          'to': 'date'
        }
      }
    }
  }, {
    '$addFields': {
      'year': {
        '$year': '$date'
      }
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
      '_id': '$year',
      'count': {
        '$sum': 1
      }
    }
  }, {
    '$sort': {
      '_id': 1
    }
  }
];

let getTotalParticipationByYear = async (limit) => {
  try {
    let aggregationTotal = aggregationBase;
    aggregationTotal[0]['$limit'] = limit;

    aggregationTotal[4]['$unwind']['path'] = '$cast';
    aggregationTotal[5]['$match'] = { 'cast.gender': { '$gt': 0, '$lt': 3 } };
    const cast = await Movie.aggregate(aggregationTotal);
    
    aggregationTotal[4]['$unwind']['path'] = '$crew';
    aggregationTotal[5]['$match'] = { 'crew.gender': { '$gt': 0, '$lt': 3 } };
    const crew = await Movie.aggregate(aggregationTotal);

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
  getParticipationOverYears: async (size, gender, showOnly) => {
    try {
      let total;
      if (gender != 3) {
        total = await getTotalParticipationByYear(size);

        if (showOnly == 'cast') {
          total = convertDataArrayToObject(total.cast);
        } else if (showOnly == 'crew') {
          total = convertDataArrayToObject(total.crew);
        } else {
          total = combineCastAndCrew(total.cast, total.crew);
        }
      }

      let aggregation = aggregationBase;
      aggregation[0]['$limit'] = size;

      if (gender == 1 || gender == 2 || gender == 3) {
        aggregation[4]['$unwind']['path'] = '$cast';
        aggregation[5]['$match'] = { 'cast.gender': gender };
      } else {
        return total;
      }

      // get data from cast/crew/both
      let cast, crew, combined;
      if (!showOnly || showOnly == 'cast') {
        cast = await Movie.aggregate(aggregation);
      }
      if (!showOnly || showOnly == 'crew') {
        aggregation[4]['$unwind']['path'] = '$crew';
        aggregation[5]['$match'] = { 'crew.gender': gender };
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
      let percentages = [];
      Object.keys(combined).forEach(key => {
        let p = combined[key] / total[key] * 100;
        percentages.push({
          'x': key,
          'y': parseFloat(p.toFixed(2))
        });
      });

      return percentages;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}