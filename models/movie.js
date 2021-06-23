const mongoose = require('mongoose');

const movieSchema = mongoose.Schema({
  adult: Boolean,
  backdrop_path: String,
  belongs_to_collection: Object,
  budget: Number,
  budgetAdjusted: Number,
  cast: [{
    adult: Boolean,
    gender: Number,
    id: Number,
    known_for_department: String,
    name: String,
    original_name: String,
    popularity: Number,
    profile_path: String,
    cast_id: Number,
    character: String,
    credit_id: String,
    order: Number
  }],
  crew: [{
    adult: Boolean,
    gender: Number,
    id: Number,
    known_for_department: String,
    name: String,
    original_name: String,
    popularity: Number,
    profile_path: String,
    credit_id: String,
    department: String,
    job: String
  }],
  genres: [{
    id: Number,
    name: String
  }],
  homepage: String,
  id: Number,
  imdb_id: String,
  original_language: String,
  original_title: String,
  overview: String,
  popularity: Number,
  poster_path: String,
  production_companies: [{
    name: String,
    id: Number,
    logo_path: String,
    origin_country: String
  }],
  production_countries: [{
    iso_3166_1: String,
    name: String
  }],
  release_date: String,
  revenue: Number,
  revenueAdjusted: Number,
  runtime: Number,
  spoken_languages: [{
    iso_639_1: String,
    name: String
  }],
  status: {
    type: String,
    enum: ['Rumored', 'Planned', 'In Production', 'Post Production', 'Released', 'Canceled']
  },
  tagline: String,
  title: String,
  video: Boolean,
  vote_average: Number,
  vote_count: Number
});

const Movie = mongoose.model('Movie', movieSchema, 'movie');

module.exports = Movie;