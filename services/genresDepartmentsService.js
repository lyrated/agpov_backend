const Movie = require('../models/movie');
const { getGender } = require('./utils');

module.exports = {
  getParticipationInGenres: async ({ size, dataset, time }) => {
    let aggregation = [
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
        '$match': {
          'year': {
            '$gte': time,
            '$lte': time+9
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
        '$group': {
          '_id': [
            '$genres.name', '$cast.gender'
          ],
          'count': {
            '$sum': 1
          }
        }
      }, {
        '$sort': {
          '_id.0': 1
        }
      }
    ];

    try {
      let data;

      let getCast = async () => {
        aggregation[6]['$unwind']['path'] = '$cast';
        aggregation[7]['$group']['_id'] = [
          '$genres.name', '$cast.gender'
        ];
        const cast = await Movie.aggregate(aggregation);
        return cast.map(c => {
          return {
            "_id": [
              c['_id'][0], "Acting", c['_id'][1]
            ],
            "count": c['count']
          }
        });
      }

      let getCrew = async () => {
        aggregation[6]['$unwind']['path'] = '$crew';
        aggregation[7]['$group']['_id'] = [
          '$genres.name', '$crew.department', '$crew.gender'
        ];
        return await Movie.aggregate(aggregation);
      }

      // aggregate
      if (dataset == 'cast') {
        data = await getCast();
      } else if (dataset == 'crew') {
        data = await getCrew();
      } else {
        const cast = await getCast();
        const crew = await getCrew();
        data = cast.concat(crew);
      }

      // make tree structure: genres -> departments -> gender
      let values = {
        name: "Genres",
        children: [{
          name: data[0]._id[0],
          children: [{
            name: data[0]._id[1],
            children: [{
              name: getGender(data[0]._id[2]),
              value: data[0].count
            }]
          }]
        }]
      };
      data.splice(0, 1);

      // put data in correct children
      data.forEach(d => {
        let genderString = getGender(d._id[2]);
        let inGenre = false;
        for (let genre of values.children) block: {
          if (d._id[0] == genre.name) {
            inGenre = true;
            let inDepartment = false;
            for (let department of genre.children) {
              if (d._id[1] == department.name) {
                inDepartment = true;
                if (genderString == "Undefined/Non-binary") {
                  let inGender = false;
                  for (let gender of department.children) {
                    if (genderString == gender.name) {
                      inGender = true;
                      gender.value += d.count;
                      break block;
                    }
                  }
                  if (!inGender) {
                    department.children.push({ name: genderString, value: d.count });
                    break block;
                  }
                } else {
                  department.children.push({ name: genderString, value: d.count });
                  break block;
                }
              }
            }
            if (!inDepartment) {
              genre.children.push({
                name: d._id[1],
                children: [{
                  name: getGender(d._id[2]),
                  value: d.count
                }]
              });
              break block;
            }
          }
        }
        if (!inGenre) {
          values.children.push({
            name: d._id[0],
            children: [{
              name: d._id[1],
              children: [{
                name: getGender(d._id[2]),
                value: d.count
              }]
            }]
          });
        }
      });

      return values;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}