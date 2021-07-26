const express = require('express');
const { getParticipationOverYears } = require('../services/timeChartService');
const { getAllGenres, getAllDepartments } = require('../services/utils');
const router = express.Router();

// filter data by:
// - time
// - genres
// - departments (acting, writing, directing, producing)

router.get('/time', async (req, res) => {
  // sample size
  let size = (req.query.size) ? +req.query.size : 555000;

  // get time
  let start = (req.query.start) ? +req.query.start : 0;
  let end = (req.query.end) ? +req.query.end : 0;

  // get genre
  let genre = null;
  const allGenres = getAllGenres();
  if (req.query.genre && allGenres[req.query.genre]) {
    genre = allGenres[req.query.genre];
  }

  // get departments:
  let dep = null;
  const allDeps = getAllDepartments(true)
  if (req.query.dep && allDeps[req.query.dep]) {
    dep = allDeps[req.query.dep];
  }

  // get category
  let category = null;
  if (req.query.category && ['genres', 'departments'].includes(req.query.category)) {
    category = req.query.category;
  }

  let data = await getParticipationOverYears({
    size: size, 
    starttime: start, 
    endtime: end, 
    genre: genre, 
    dep: dep,
    category: category
  });
  res.send(data);
});

module.exports = router;
