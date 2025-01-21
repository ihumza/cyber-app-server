const {
  login,
  register,
  fetchProfile,
  updateProfile,
  updateUserProfile,
} = require('../controllers/auth.controller');

const router = require('express').Router();
//routes
router.route('/profile').get(fetchProfile);
router.route('/login').post(login);
router.route('/register').post(register);
router.route('/profile').post(updateProfile);
router.route('/userProfile').post(updateUserProfile);

module.exports = router;
