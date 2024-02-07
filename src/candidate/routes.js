const { Router } = require('express');
const controller = require('../candidate/controller');

const router = Router();

router.get('/', controller.getAllCandidates);
router.post('/create', controller.registerNewCandidate);
router.put('/', controller.updateCandidate);
router.delete('/', controller.deleteCandidate);

module.exports = router;