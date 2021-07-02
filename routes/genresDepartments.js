const express = require('express');
const { getParticipationInGenres } = require('../services/genresDepartmentsService');
const router = express.Router();


router.get('/genres-departments', async (req, res) => {
  // sample size
  let size = 555000;
  if(req.query.size) {
    size = +req.query.size;
  }
  
  // show only cast/crew
  let dataset = null;
  if (req.query.dataset && (req.query.dataset == 'cast' || req.query.dataset == 'crew')) {
    dataset = req.query.dataset;
  }

  let data = await getParticipationInGenres(size, dataset);
  res.send(data);
});

module.exports = router;