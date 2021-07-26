module.exports = {
  // get gender as string from number (0, 1, 2, 3)
  getGender: (number) => {
    let gender;
    if (number == 0 || number == 3) {
      gender = "Undefined/Non-binary";
    } else if (number == 1) {
      gender = "Female";
    } else if (number == 2) {
      gender = "Male";
    }
    return gender;
  },

  getAllGenres: () => {
    // hardcoded for speed, taken from db
    // -> Movie.distinct('genres.name');
    return {
      action: 'Action', adventure: 'Adventure',
      animation: 'Animation', comedy: 'Comedy',
      crime: 'Crime', documentary: 'Documentary',
      drama: 'Drama', family: 'Family',
      fantasy: 'Fantasy', history: 'History',
      horror: 'Horror', music: 'Music',
      mystery: 'Mystery', romance: 'Romance',
      sciencefiction: 'Science Fiction', tvmovie: 'TV Movie',
      thriller: 'Thriller', war: 'War', western: 'Western'
    };
  },

  getAllDepartments: (mainDepartments) => {
    // hardcoded for speed, taken from db
    // -> Movie.distinct('crew.department');
    if (mainDepartments) {
      return {
        acting: 'Acting', directing: 'Directing', production: 'Production', writing: 'Writing'
      };
    }
    return {
      acting: 'Acting', actors: 'Actors', art: 'Art',
      camera: 'Camera', costumemakeup: 'Costume & Make-Up',
      crew: 'Crew', directing: 'Directing', editing: 'Editing',
      lighting: 'Lighting', production: 'Production', sound: 'Sound',
      visualeffects: 'Visual Effects', writing: 'Writing'
    };
  },

  // convert array from mongodb aggregations to object { _id: value }
  convertDataArrayToObject: (array) => {
    let obj = {};
    array.forEach(c => obj[c._id] = c.count);
    return obj;
  },

  // combine results from cast & crew aggregations
  // format: { '_id': [1990, 'Comedy'], 'count': 123 }
  // or: { '_id': 'Comedy', 'count': 123 }
  combineCastAndCrew: (cast, crew) => {
    let combined = {};

    const add = (c) => {
      let key = c._id;
      let count = c.count;
      if (Array.isArray(key)) {
        key = c._id[0];
        count = { name: c._id[1], count: c.count };
        if (combined[key]) {
          combined[key].push(count);
        } else {
          combined[key] = [count];
        }
      } else {
        if (combined[key]) {
          combined[key] += count;
        } else {
          combined[key] = count
        }
      }
    }

    cast.forEach(add);
    crew.forEach(add);

    return combined;
  }
}