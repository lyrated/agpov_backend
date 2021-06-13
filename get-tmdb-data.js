const db = require('./config/db');
const Movie = require('./models/movie');
const fetch = require('node-fetch');
const api_key = 'd21989c816db54b6433c0046a7f416ac';

db.connectDB();

// last ID retrieved from /movie/latest
async function getLastMovie() {
  let res = await fetch(`https://api.themoviedb.org/3/movie/latest?api_key=${api_key}`, { method: 'Get' });
  let json = await res.json();
  return json.id;
}

async function fetchMovie(i, movies, cb) {
  // missing values
  try {
    let url = `https://api.themoviedb.org/3/movie/${movies[i].id}?api_key=${api_key}`;
    let res = await fetch(url, { method: 'Get' });
    let data = await res.json();

    if (typeof data.success === 'undefined') {
      // cast and crew
      let creditsUrl = `https://api.themoviedb.org/3/movie/${movies[i].id}/credits?api_key=${api_key}`;
      let credits = await fetch(creditsUrl, { method: 'Get' });
      let creditsData = await credits.json();

      await Movie.findByIdAndUpdate(movies[i]._id, {
        $set: {
          release_date: data.release_date,
          revenue: data.revenue,
          runtime: data.runtime,
          cast: creditsData.cast,
          crew: creditsData.crew
        }
      })
      console.log(`- updated #${movies[i].id}`);
    } else {
      console.log(`#${movies[i].id}:`, data.status_message);
    }
  } catch (error) {
    console.error(error);
    setTimeout(cb(i, movies), 20000);
  }

  i++;
  cb(i, movies);
}

function recursiveCall(i, movies) {
  if (i < movies.length) {
    fetchMovie(i, movies, recursiveCall);
  } else {
    console.log('### FINISHED ###');
    db.disconnectDB();
  }
}

let params = { cast: { $exists: false } };
Movie.deleteMany(params).then(x => console.log(x));
// Movie.find(params).then(m => {
//   fetchMovie(0, m, recursiveCall);
// });
// getLastMovie().then(id => fetchMovie(id, recursiveCall));