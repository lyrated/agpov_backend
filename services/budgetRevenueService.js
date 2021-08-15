const Movie = require('../models/movie');


module.exports = {

  getBudgetAndRevenue: async (limit, type) => {
    const aggregation = [
      {
        '$limit': limit
      }, {
        '$match': {
          'budgetAdjusted': {
            '$gt': 0
          },
          'revenueAdjusted': {
            '$gt': 0
          }
        }
      }, {
        '$unwind': {
          'path': '$genres',
          'preserveNullAndEmptyArrays': false
        }
      }, {
        '$addFields': {}
      }, {
        '$match': {}
      }, {
        '$group': {
          '_id': '$genres.name',
          'count': {
            '$sum': 1
          },
          'avgBudget': {
            '$avg': '$budgetAdjusted'
          },
          'avgRevenue': {
            '$avg': '$revenueAdjusted'
          }
        }
      }, {
        '$addFields': {
          'profit': {
            '$subtract': [
              '$avgRevenue', '$avgBudget'
            ]
          },
          'category': 'women'
        }
      }
    ];

    try {
      aggregation[0]['$limit'] = limit;

      // female
      if (type == 'acting') {
        aggregation[3]['$addFields'] = {
          'lead': {
            '$arrayElemAt': ['$cast', 0]
          }
        }
        aggregation[4]['$match'] = {
          'lead.gender': 1
        }
      } else if (type == 'directing') {
        aggregation[3]['$addFields'] = {
          'directors': {
            '$filter': {
              'input': '$crew',
              'as': 'director',
              'cond': {
                '$eq': [
                  '$$director.department', 'Directing'
                ]
              }
            }
          }
        };
        aggregation[4]['$match'] = {
          'directors.gender': {
            '$nin': [0, 2, 3]
          }
        }
      }

      let women, men, mixed;
      aggregation[6]['$addFields']['category'] = 'women';
      women = await Movie.aggregate(aggregation);

      // male
      if (type == 'acting') {
        aggregation[4]['$match']['lead.gender'] = 2;
        aggregation[6]['$addFields']['category'] = 'men';
        men = await Movie.aggregate(aggregation);
      } else if (type == 'directing') {
        aggregation[4]['$match']['directors.gender'] = 2;
        aggregation[6]['$addFields']['category'] = 'men';
        men = await Movie.aggregate(aggregation);

        // mixed
        aggregation[4]['$match'] = {
          '$and': [{
              'directors.gender': { '$nin': [0, 3] }
            }, {
              'directors.gender': 1
            }, {
              'directors.gender': 2
            }
          ]};
        aggregation[6]['$addFields']['category'] = 'mixed';
        mixed = await Movie.aggregate(aggregation);
      }

      let result = women.concat(men);
      result = mixed ? result.concat(mixed) : result;

      return result;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

}