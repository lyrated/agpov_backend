const express = require('express');
const { getParticipationInGenres } = require('../services/genresDepartmentsService');
const router = express.Router();


router.get('/api/genres-departments', async (req, res) => {
  // get gender from query
  let gender = null;
  if (req.query.gender && (req.query.gender == 1 || req.query.gender == 2 || req.query.gender == 3)) {
    gender = parseInt(req.query.gender);
  }

  // show only cast/crew
  let showOnly = null;
  if (req.query.only && (req.query.only == 'cast' || req.query.only == 'crew')) {
    showOnly = req.query.only;
  }

  let data = await getParticipationInGenres(gender, showOnly);
  res.send(data);
});

module.exports = router;