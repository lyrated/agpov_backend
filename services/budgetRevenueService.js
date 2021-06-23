const Movie = require('../models/movie');

const aggregationBase = [
  {
    '$limit': 555000
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
    '$unwind': {
      'path': "$crew",
      'preserveNullAndEmptyArrays': false
    }
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
      }
    }
  }, {
    '$sort': {
      'profit': -1
    }
  }
];

module.exports = {

  getBudgetAndRevenue: async (limit, type) => {
    try {
      const aggregation = aggregationBase.map(a => a);
      aggregation[0]['$limit'] = limit;

      if (type == 'acting') {
        aggregation[3] = {
          "$addFields": {
            "lead": {
              "$arrayElemAt": ["$cast", 0]
            }
          }
        }
        aggregation[4]['$match'] = {
          "lead.gender": 1
        }
      } else if (type == 'directing') {
        aggregation[4]['$match'] = {
          'crew.gender': 1,
          'crew.department': 'Directing'
        };
      }

      let women, men, mixed;
      women = await Movie.aggregate(aggregation);

      if (type == 'acting') {
        aggregation[4]['$match']['lead.gender'] = 2;
        men = await Movie.aggregate(aggregation);
      } else if (type == 'directing') {
        aggregation[4]['$match']['crew.gender'] = 2;
        men = await Movie.aggregate(aggregation);
        aggregation[4]['$match']['crew.gender'] = { $gt: 0, $lt: 3 };
        mixed = await Movie.aggregate(aggregation);
      }

      return {
        women: women,
        men: men,
        mixeed: mixed
      };
    } catch (error) {
      console.error(error);
      return null;
    }
  }

}