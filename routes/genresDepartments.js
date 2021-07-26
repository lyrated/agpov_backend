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

  // show time interval 1915, 1925, 1935, ...
  let time = 2015;
  if (req.query.time && (req.query.time % 5 == 0) &&
    (req.query.time >= 1915) && (req.query.time <= 2015)) {
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