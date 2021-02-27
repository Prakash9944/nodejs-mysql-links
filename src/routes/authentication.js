const express = require('express');
const router = express.Router();

const passport = require('passport');
const { isLoggedIn } = require('../lib/auth');
const winston = require('winston');
const appRoot = require('app-root-path');
const { stLogger, stHttpLoggerMiddleware } = require('sematext-agent-express')


const loadConfiguration = {
    'transports': [
        new winston.transports.File({
            filename: `${appRoot}/node.log`
        })
    ]
}

const logger = winston.createLogger(loadConfiguration);

logger.log({
    message: 'authenticatation controller for nodejs',
    level: 'info'
})

// SIGNUP
router.get('/signup', (req, res) => {
    logger.log({
        message: 'signup call',
        level: 'info'
    })

      stLogger.info('Hello World.')
      stLogger.debug('Hello debug.')
      stLogger.warn('Some warning.')
      stLogger.error('Some error.')

  res.render('auth/signup');
});

router.post('/signup', passport.authenticate('local.signup', {

  successRedirect: '/profile',
  failureRedirect: '/signup',
  failureFlash: true
}));

// SINGIN
router.get('/signin', (req, res) => {

          stLogger.info('Hello World.')
      stLogger.debug('Hello debug.')
      stLogger.warn('Some warning.')
      stLogger.error('Some error.')
  res.render('auth/signin');
});

router.post('/signin', (req, res, next) => {
  req.check('username', 'Username is Required').notEmpty();
  req.check('password', 'Password is Required').notEmpty();
  const errors = req.validationErrors();
  if (errors.length > 0) {
    req.flash('message', errors[0].msg);
    res.redirect('/signin');
  }
  passport.authenticate('local.signin', {
    successRedirect: '/profile',
    failureRedirect: '/signin',
    failureFlash: true
  })(req, res, next);
});

router.get('/logout', (req, res) => {
  req.logOut();
  res.redirect('/');
});

router.get('/profile', isLoggedIn, (req, res) => {
  res.render('profile');
});

module.exports = router;
