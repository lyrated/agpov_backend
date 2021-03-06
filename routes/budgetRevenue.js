const express = require('express');
const { getBudgetAndRevenue, getBudgetAndRevenueFromFiles } = require('../services/budgetRevenueService');
const { getAllDepartments } = require('../services/utils');
const router = express.Router();

router.get('/profit', async (req, res) => {
  // sample size
  let size = 555000;
  if (req.query.size) {
    size = +req.query.size;
  }

  // type: lead actress or directors
  let type = 'acting';
  const allDeps = getAllDepartments(true);
  if (req.query.dataset && allDeps[req.query.dataset]) {
    type = req.query.dataset;
  }

  let data;
  if (process.env.NODE_ENV === 'production') {
    data = await getBudgetAndRevenueFromFiles(type);
  } else {
    data = await getBudgetAndRevenue(size, type);
  }
  res.send(data);
});

module.exports = router;