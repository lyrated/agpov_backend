const express = require('express');
const { getBudgetAndRevenue } = require('../services/budgetRevenueService');
const router = express.Router();

router.get('/profit', async (req, res) => {
  // sample size
  let size = 555000;
  if(req.query.size) {
    size = +req.query.size;
  }

  // type: lead actress or directors
  let type = 'directing';
  if (req.query.dataset && (req.query.dataset == 'acting' || req.query.dataset == 'directing')) {
    type = req.query.dataset;
  }

  const data = await getBudgetAndRevenue(size, type);
  res.send(data);
});

module.exports = router;