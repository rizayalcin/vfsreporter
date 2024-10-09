// index.js
require('dotenv').config();
const puppeteer = require('puppeteer-core');
const chrome = require('chrome-aws-lambda');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });

async function sendTelegramMessage(message) {
    try {
        await bot.sendMessage(TELEGRAM_CHAT_ID, message);
        console.log('Telegram message sent successfully');
    } catch (error) {
        console.error('Error sending Telegram message:', error);
    }
}

async function login(page, email, password) {
    await page.goto('https://visa.vfsglobal.com/tur/tr/fra/login');
    await page.waitForSelector('input[formcontrolname="username"]');
    await page.type('input[formcontrolname="username"]', email, { delay: 100 });
    await page.type('input[formcontrolname="password"]', password, { delay: 100 });
    
    // Human verification (you may need to adjust this based on the actual page structure)
    await page.evaluate(() => {
        const checkbox = document.querySelector('input[type="checkbox"]');
        if (checkbox) checkbox.click();
    });
    
    await page.waitForTimeout(2000);
    await page.click('button[type="submit"]');
    await page.waitForNavigation();
}

async function checkAppointment(page) {
    await page.goto('https://visa.vfsglobal.com/tur/tr/fra/application-detail');
    
    // Select options (you may need to adjust these selectors based on the actual page structure)
    await page.select('select[formcontrolname="centerCode"]', 'France Visa Application Centre - Istanbul Beyoglu');
    await page.select('select[formcontrolname="selectedSubvisaCategory"]', 'Short Term / Kisa Donem / Court Sejour');
    await page.select('select[formcontrolname="visaCategoryCode"]', 'Short Term Standard');
    
    await page.waitForTimeout(3000);
    
    const messageElement = await page.$('div.alert.alert-info.border-0.rounded-0');
    if (messageElement) {
        const message = await page.evaluate(el => el.textContent, messageElement);
        await sendTelegramMessage(`VFS Fransa/Short Term : ${message}`);
    }
}

async function main() {
    let browser = null;
    browser = await chromium.puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath,
            headless: chromium.headless,
            ignoreHTTPSErrors: true,
        });
    const page = await browser.newPage();
    
    try {
        await login(page, process.env.VFS_EMAIL, process.env.VFS_PASSWORD);
        await checkAppointment(page);
    } catch (error) {
        console.error('An error occurred:', error);
        await sendTelegramMessage(`Error: ${error.message}`);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

module.exports = main;
