const Movie = require('../models/movie');
const { getAllDepartments } = require('./utils');


module.exports = {

  getBudgetAndRevenue: async (limit, type) => {
    const aggregation = [
      {
        '$limit': limit
      }, {
        '$match': {
          'budgetAdjusted': {
            '$lt': 5000000000,
            '$gt': 1
          },
          'revenueAdjusted': {
            '$lt': 5000000000,
            '$gt': 1
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
          'category': 'female'
        }
      }, {
        '$sort': { 'profit': -1 }
      }
    ];

    const allDeps = getAllDepartments(true);

    try {
      aggregation[0]['$limit'] = limit;

      // female
      if (type === 'acting') {
        aggregation[3]['$addFields'] = {
          'lead': {
            '$arrayElemAt': ['$cast', 0]
          }
        }
        aggregation[4]['$match'] = {
          'lead.gender': 1
        }
      } else if (type !== 'acting' && allDeps[type]) {
        aggregation[3]['$addFields'] = {
          'dep': {
            '$filter': {
              'input': '$crew',
              'as': 'd',
              'cond': {
                '$eq': [
                  '$$d.department', allDeps[type]
                ]
              }
            }
          }
        };
        aggregation[4]['$match'] = {
          'dep.gender': {
            '$nin': [0, 2, 3]
          }
        }
      }

      let women, men, mixed;
      aggregation[6]['$addFields']['category'] = 'female';
      women = await Movie.aggregate(aggregation);

      // male
      if (type == 'acting') {
        aggregation[4]['$match']['lead.gender'] = 2;
        aggregation[6]['$addFields']['category'] = 'male';
        men = await Movie.aggregate(aggregation);
      } else if (type !== 'acting' && allDeps[type]) {
        aggregation[4]['$match']['dep.gender'] = { '$nin': [0, 1, 3] };
        aggregation[6]['$addFields']['category'] = 'male';
        men = await Movie.aggregate(aggregation);

        // mixed
        aggregation[4]['$match'] = {
          '$and': [{
            'dep.gender': { '$nin': [0, 3] }
          }, {
            'dep.gender': 1
          }, {
            'dep.gender': 2
          }]
        };
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