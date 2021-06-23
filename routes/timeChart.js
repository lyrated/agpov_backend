const express = require('express');
const { getParticipationOverYears } = require('../services/timeChartService');
const router = express.Router();


router.get('/years', async (req, res) => {
  // sample size
  let size = 555000;
  if(req.query.size) {
    size = +req.query.size;
  }

  // get gender from query
  let gender = null;
  if (req.query.gender && (req.query.gender == 1 || req.query.gender == 2 || req.query.gender == 3)) {
    gender = +req.query.gender;
  }

  // show only cast/crew
  let showOnly = null;
  if (req.query.only && (req.query.only == 'cast' || req.query.only == 'crew')) {
    showOnly = req.query.only;
  }

  let data = await getParticipationOverYears(size, gender, showOnly);
  res.send(data);
});

module.exports = router;
