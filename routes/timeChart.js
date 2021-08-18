const express = require('express');
const { getParticipationOverYears, getParticipationFromFiles } = require('../services/timeChartService');
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
  let start = (req.query.start) ? +req.query.start : 1920;
  let end = (req.query.end) ? +req.query.end : 2020;
  let startCopy = start;
  if (start > end) {
    start = end;
    end = startCopy;
  }

  // get genre
  let genre = null;
  const allGenres = getAllGenres();
  if (req.query.genre && allGenres[req.query.genre]) {
    genre = allGenres[req.query.genre];
  }

  // get departments:
  let dep = null;
  const allDeps = getAllDepartments(true);
  if (req.query.dep && allDeps[req.query.dep]) {
    dep = allDeps[req.query.dep];
  }

  // get category
  let category = null;
  if (req.query.category && ['genres', 'departments'].includes(req.query.category) && !(genre || dep)) {
    category = req.query.category;
  }

  const params = {
    size: size,
    starttime: start,
    endtime: end,
    genre: genre,
    dep: dep,
    category: category
  }

  let data;
  if (process.env.NODE_ENV === 'production') {
    data = await getParticipationFromFiles(params);
  } else {
    data = await getParticipationOverYears(params);
  }
  res.send(data);
});

module.exports = router;
