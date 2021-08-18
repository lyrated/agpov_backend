const Movie = require('../models/movie');
const { combineCastAndCrew, getAllGenres, getAllDepartments } = require('./utils');

module.exports = {
  getParticipationOverYears: async ({ size, starttime, endtime, genre, dep, category }) => {
    const aggregation = [
      {
        '$limit': size
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
          'path': '$genres',
          'preserveNullAndEmptyArrays': true
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

    // time filter
    let start = starttime == 0 ? 1912 : starttime;
    let end = endtime == 0 ? 2021 : endtime;
    aggregation[6]['$match']['year'] = { '$gte': start, '$lte': end };

    // genre filter
    if (genre) {
      aggregation[6]['$match']['genres.name'] = genre;
    } else {
      delete aggregation[6]['$match']['genres.name'];
    }

    // category filter
    if (category) {
      let cat;
      if (category == 'genres') cat = '$genres.name';
      if (category == 'departments') cat = '$crew.department';
      if (cat) aggregation[7]['$group']['_id'] = ['$year', cat];
    } else {
      aggregation[7]['$group']['_id'] = '$year';
    }

    // get data from cast/crew/both
    let cast = [], crew = [], combined;
    let castTotal = [], crewTotal = [], total;

    try {
      if (dep != 'Acting') {
        aggregation[5]['$unwind']['path'] = '$crew';
        aggregation[6]['$match']['crew.gender'] = 1;

        // department filter
        if (dep) {
          let department = dep;
          aggregation[6]['$match']['crew.department'] = department;
        } else {
          delete aggregation[6]['$match']['crew.department'];
        }

        crew = await Movie.aggregate(aggregation);

        // get total crew
        aggregation[6]['$match']['crew.gender'] = { '$gt': 0, '$lt': 3 };
        crewTotal = await Movie.aggregate(aggregation);
      }

      if (!dep || dep == 'Acting') {
        aggregation[5]['$unwind']['path'] = '$cast';
        aggregation[6]['$match']['cast.gender'] = 1;
        aggregation[6]['$match']['year'] = { '$gte': start, '$lte': end };
        delete aggregation[6]['$match']['crew.gender'];
        delete aggregation[6]['$match']['crew.department'];
        if (category == 'departments') aggregation[7]['$group']['_id'] = ['$year', 'Acting'];
        cast = await Movie.aggregate(aggregation);

        // get total cast
        aggregation[6]['$match']['cast.gender'] = { '$gt': 0, '$lt': 3 };
        castTotal = await Movie.aggregate(aggregation);
      }

      combined = combineCastAndCrew(cast, crew);
      total = combineCastAndCrew(castTotal, crewTotal);
      
      // get percentages of each year
      const percentages = [];
      const years = [];
      if (Object.keys(combined).length !== 0) {
        for (let i = start; i <= end; i++) {
          years.push(i);
        }
      }
      years.forEach(key => {
        let value = combined[key] ? combined[key] : 0;
        let totalValue = total[key] ? total[key] : 1;

        // if category
        if (category) {
          let data = { name: key, total: 0 }

          let totalCount = 0;
          Object.keys(totalValue).forEach(t => {
            totalCount += totalValue[t];
          });

          Object.keys(value).forEach(v => {
            let num = value[v] / totalCount * 100
            data[v] = +(Math.round(num * 100) / 100).toFixed(2);
            data['total'] += data[v];
          });

          data['total'] = +(Math.round(data['total'] * 100) / 100).toFixed(2);
          percentages.push(data);
        } else {
          let p = value / totalValue * 100;
          percentages.push({
            'x': key,
            'y': +(Math.round(p * 100) / 100).toFixed(2)
          });
        }
      });

      if (category) {
        let cat = category == 'genres' ? getAllGenres() : getAllDepartments();
        let columns = ['name', 'Undefined'].concat(Object.values(cat));
        return { data: percentages, columns: columns };
      } else {
        return percentages;
      }
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}