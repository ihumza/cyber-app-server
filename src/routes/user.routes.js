const {
  listUsers,
  addUser,
  editProfile,
  editUser,
  deleteUser,
  getUserByUsername,
} = require('../controllers/user.controller');
const sanitize = require('../middlewares/sanitize-body');

const router = require('express').Router();

router.get('/', listUsers);
router.get('/:username', getUserByUsername);
router.post('/add', sanitize, addUser);
router.post('/update', sanitize, editUser);
router.post('/edit/profile', sanitize, editProfile);
router.post('/change/photo', () => {});
router.delete('/:id', sanitize, deleteUser);
router.post('/login/check', () => {});

module.exports = router;
