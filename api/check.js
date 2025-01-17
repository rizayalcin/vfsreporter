require('dotenv').config();

const main = require('../index');
const puppeteer = require('puppeteer-core');
const chrome = require('chrome-aws-lambda');

module.exports = async (req, res) => {
    try {
        await main();
        res.status(200).send('Appointment check completed successfully');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('An error occurred: ' + error.message);
    }
};
