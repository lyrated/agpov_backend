const express = require('express');
const { getParticipationInGenres } = require('../services/genresDepartmentsService');
const router = express.Router();


router.get('/genres-departments', async (req, res) => {
  // sample size
  let size = 555000;
  if (req.query.size) {
    size = +req.query.size;
  }

  // show only cast/crew/both
  let dataset = null;
  if (req.query.dataset && (req.query.dataset == 'cast' || req.query.dataset == 'crew')) {
    dataset = req.query.dataset;
  }

  // show time interval 1920-1929, 1930-1939, 1940-1949, ...
  let time = 2010;
  if (req.query.time && (req.query.time % 10 === 0) &&
    (req.query.time >= 1920) && (req.query.time <= 2020)) {
    time = +req.query.time;
  }

  let data = await getParticipationInGenres({
    size: size,
    dataset: dataset,
    time: time
  });
  res.send(data);
});

module.exports = router;