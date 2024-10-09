require('dotenv').config();
const puppeteer = require('puppeteer');
const main = require('../index');

module.exports = async (req, res) => {
    try {
        await main();
        res.status(200).send('Appointment check completed successfully');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('An error occurred: ' + error.message);
    }
};
