const express = require('express');
const router = express.Router();

const pool = require('../database');
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


router.get('/add', (req, res) => {
    res.render('links/add');
});

router.post('/add', async (req, res) => {
    const { title, url, description } = req.body;
    const newLink = {
        title,
        url,
        description,
        user_id: req.user.id
    };

    logger.log({
        message: 'add user for nodejs',
        level: 'info'
    })
    await pool.query('INSERT INTO links set ?', [newLink]);
    req.flash('success', 'Link Saved Successfully');
    res.redirect('/links');
});

router.get('/', isLoggedIn, async (req, res) => {
      stLogger.info('get all logged links ')
      stLogger.debug('Hello debug.')
      stLogger.warn('Some warning.')
      stLogger.error('Some error.')
    const links = await pool.query('SELECT * FROM links WHERE user_id = ?', [req.user.id]);
    setTimeout(function(){ res.render('links/list', { links }); }, 10000);
});

router.get('/delete/:id', async (req, res) => {
        logger.log({
            message: 'delete user for nodejs',
            level: 'info'
        })
    const { id } = req.params;
    await pool.query('DELETE FROM links WHERE ID = ?', [id]);
    req.flash('success', 'Link Removed Successfully');
    res.redirect('/links');
});

router.get('/edit/:id', async (req, res) => {
     stLogger.info('edit url links ')
    const { id } = req.params;
    const links = await pool.query('SELECT * FROM links WHERE id = ?', [id]);
    console.log(links);
    res.render('links/edit', {link: links[0]});
});

router.post('/edit/:id', async (req, res) => {

            logger.log({
            message: 'update user for nodejs',
            level: 'info'
        })
    stLogger.info('update  url links ')
    const { id } = req.params;
    const { title, description, url} = req.body;
    const newLink = {
        title,
        description,
        url
    };
    await pool.query('UPDATE links set ? WHERE id = ?', [newLink, id]);
    req.flash('success', 'Link Updated Successfully');
    res.redirect('/links');
});

module.exports = router;