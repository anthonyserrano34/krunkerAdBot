//#region Variables initialization
const playwright = require('playwright'); // # Importation du module Playwright (API navigateur headless)
const prompt = require('prompt-sync')(); // # Importation du module Prompt (permet de lire une valeur rentrée par l'utilisateur en ligne de commande)
const config = require('./config/config.js'); // # Importation du fichier de configuration
const fs = require('fs'); // # Importation du module Filesystem (permet de lire et écrire des fichiers)
var clui = require('clui'); // # Importation du module Clui (barre de progression)
var Progress = clui.Progress; // # Définit Progress comme étant la classe Progress du module Clui
var progressBar = new Progress(20); // # Création de la barre de progression sous le nom progressBar
browserType = playwright.firefox; // # Définit le navigateur comme étant Firefox (Nightly)
var gameIsFull = true; // # Variable permettant de savoir si la partie est pleine ou non
var isLogged = false; // # Variable permettant de savoir si on est connecté au compte ou non
var retry = 0; // # Initialisation du nombre d'essai de connexion à l'URL à 0.
const selectorCurrentKR = config.selector.currentKR; // # Création des variables sans propriétés afin de pouvoir la passer dans le scope du navigateur
const selectorCookies = config.selector.cookies;
const selectorErrorMessage = config.selector.errorMessage;
const freeSpinBanner = config.selector.freeSpinBanner;
const selectorKRLoot = config.selector.krLoot;
const selectorTotalKR = config.selector.totalKR;
const selectorSpinButton = config.selector.spinButton;
const usernameField = config.selector.usernameField;
const passwordField = config.selector.passwordField; // # Jusqu'ici ##############
var loginAttempt; // # Définit le nombre d'essai de connexion au compte à 0.
var page, browser, context; // # Définit les variables nécessaires à Playwright.
var i = 0; // # Initialise l'incrémenteur i à 0.
var accName, username, password, credentials; // # Définit les informations de connexions.
const menuList = (`
    ######################################################\n
    1 - Launch the bot\n
    2 - Account list \n
    3 - Add an account to the list\n
    4 - Remove an account from the list\n
    5 - Add proxy (unavailable for the moment)\n
    6 - Exit the program\n
    ######################################################\n`); // # Message du menu
var accList = JSON.parse(fs.readFileSync(config.path.accountList)); // # Parse le fichier accountList.json et le définit sous la variable "accList"
//#endregion

(async () => {

    //#region Program start
    console.log(`                          
    _____             _              _____   _    _____     _   
   |  |  |___ _ _ ___| |_ ___ ___   |  _  |_| |  | __  |___| |_ 
   |    -|  _| | |   | '_| -_|  _|  |     | . |  | __ -| . |  _|
   |__|__|_| |___|_|_|_,_|___|_|    |__|__|___|  |_____|___|_|  
                                ${config.version}                                
   `)

    console.log(menuList);
    return await menu();

    //#endregion

    //#region Menu function
    async function menu() {
        console.log(``);
        var choice = prompt(`► Select option (type MENU to show the menu) : `).toLowerCase();
        switch (choice) {
            case '1':
                return await init();
            case '2':
                await accountList();
                break;
            case '3':
                return await addAccount();
            case '4':
                return await delAccount();
            case '5':
                console.log(`Proxys will be available soon.`);
                break;
            case '6':
            case 'exit':
                console.log(`Bye, have a great day ♥`)
                process.exit(0);
            case 'menu':
                console.log(menuList);
                break;
            default:
                console.log(`Invalid option.`)
        }
        return await menu();
    }
    //#endregion

    //#region accountList function

    async function accountList() {
        if (accList.length > 0) {
            emptyAccountList = false;
            console.log(`
                    Account list :`)
            for (account of accList) {
                i++;
                credentials = account.split(':');
                username = credentials[0];
                password = credentials[1];
                console.log(`
                        • ${i} - Username : ${username} | Password : ${password}`)
            }
            i = 0;
        }
        else {
            console.log(`
                    ▬ There isn't any account on the list.`)
            emptyAccountList = true;
        }
    }

    //#endregion

    //#region addAcount function
    async function addAccount() {
        try {
            var regex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
            console.log();
            const username = prompt(`Username of the account (type CANCEL to return to the menu) : `);
            if (username.toLowerCase() == 'cancel') {
                return await menu();
            }
            else if (regex.test(username)) {
                console.log(`Please enter a valid username (only contains letters and digits characters).`)
                return await addAccount();
            }
            else {
                const password = prompt(`Password of the account (type CANCEL to return to the menu) : `);
                if (password.toLowerCase() == 'cancel') {
                    return await menu();
                }
                else if (regex.test(password)) {
                    console.log(`Please enter a valid password (only contains letters and digits characters).`)
                    return await addAccount();
                }
                else {
                    credentials = `${username}:${password}`;
                    accList.push(credentials);
                    newAccList = JSON.stringify(accList);
                    fs.writeFileSync(config.path.accountList, newAccList);
                    console.log(`
                        ♥ Account ${username} added !`);
                }
            }
        }
        catch (e) {
            console.log(`
                    ▬ Error while trying to add an account ! ${e}`)
        }
        return await menu();
    }
    //#endregion

    //#region delAccount function
    async function delAccount() {
        await accountList();
        if (!emptyAccountList) {
            console.log(``);
            const choice = prompt(`Select which account you want to delete (type CANCEL to return to menu) : `);
            if (choice.toLowerCase() == 'cancel') {
                return await menu();
            }
            else {
                try {
                    accList.splice(choice - 1, 1);
                    newAccList = JSON.stringify(accList);
                    fs.writeFileSync(config.path.accountList, newAccList);
                    console.log(`
                            ♥ Account deleted successfully !`);
                }
                catch (e) {
                    console.log(`\n
                            ▬ Error while trying to delete the account : ${e}`);
                }
            }
        }
        return await menu();
    }
    //#endregion

    //#region init function
    async function init() {
        if (accList.length > 0) {
            while (1) {
                for await (account of accList) {
                    credentials = account.split(':');
                    username = credentials[0];
                    password = credentials[1];
                    console.log(`\n########################## ${username} ##########################\n`);
                    await launchBrowser();
                    i++
                }
                console.log(`Done ! Sleeping until 1 hour.`)
                return setTimeout(init, 3600000);
            }
        }
        else {
            console.log(`
                    ▬ You need to add an account to the list before launching the bot !`);
            return await menu();
        }
    }
    //#endregion

    //#region launchBrowser function
    async function launchBrowser() {
        console.log(`Proxy : ${config.proxies[i]}`);
        try {
            browser = await browserType.launch({
                headless: true, args: ['--mute-audio']
            });
            context = await browser.newContext();
            page = await context.newPage();
            console.log(`${progressBar.update(0.1)} ${username} : Launching browser`);
            await loadGame();
        }
        catch (e) {
            console.log(`launchBrowser e : ${e}`)
        }
    }
    //#endregion

    //#region loadGame function

    async function loadGame() {
        try {
            console.log(`${progressBar.update(0.2)} ${username} : Loading ${config.URL}`)
            await page.goto(config.URL);
            if (config.debugMode) {
                await page.screenshot({ path: `screenshots/${username}-loading.png` });
                console.log(`${progressBar.update(0.2)} ${username} - Screenshot of page (DEBUG MODE)`)
            }
            try {
                await page.waitForFunction(() => 'gameLoaded' in window)
                    .then(() => console.log(`${progressBar.update(0.3)} ${username} : Krunker.io is loaded`))
                isGameLoaded = true;
                return await findGame();
            }
            catch (e) {
                if (config.debugMode) {
                    await page.screenshot({ path: `screenshots/${username}-error-screenshot.png` });
                }
                console.log(`${username} : Krunker.io failed to load \n ${e}`)
                return await loadGame();
            }
        }
        catch (e) {
            ++retry;
            console.log(`${username} : Reconnect to ${config.URL} - ${3 - retry} attempts remaining : \n ${e}`);
            if (retry >= config.retryMax) {
                throw new Error(`${username} : Maximum number of attempts reached (${retry}/${config.retryMax})`);
            }
            else {
                return await loadGame();
            }
        }
    }

    //#endregion

    //#region findGame function
    async function findGame() {
        gameIsFull = true;
        while (gameIsFull) {
            console.log(`${progressBar.update(0.3)} ${username} : Finding a game`);
            try {
                await page.waitForSelector(config.selector.errorMessage);
                const errorMessage = await page.evaluate((selectorErrorMessage) => {
                    return document.querySelector(selectorErrorMessage).innerText;;
                }, selectorErrorMessage);
                if (errorMessage !== undefined) {
                    console.log(`${username} : ${errorMessage} ❌`)
                    return await loadGame();
                }
            } catch {
                console.log(`${progressBar.update(0.4)} ${username} : Game found`);
                gameIsFull = false;
                await acceptCookies();
            }
        }
    }
    //#endregion

    //#region acceptCookies function
    async function acceptCookies() {
        try {
            await page.click(config.selector.cookies);
            console.log(`${progressBar.update(0.5)} ${username} : Cookies accepted`);
        }
        catch (e) {
            console.log(`${progressBar.update(0.5)} ${username} : Didn't found any cookies pop-up`);
        }
        await login();
    }
    //#endregion

    //#region login function
    async function login() {
        loginAttempt = 0;
        isLogged = false;
        while (!isLogged) {
            try {
                await page.evaluate(() => showWindow(5))
                await page.type(usernameField, username);
                await page.type(passwordField, password);
                await page.evaluate(() => loginAcc());
                await page.waitForTimeout(5000);
                accName = await page.evaluate(() => {
                    return getGameActivity().user;;
                });
                if (accName.toLowerCase().includes('guest')) {
                    loginAttempt++;
                    console.log(`${username} : Failed to login : ${loginAttempt}/${config.maxLoginAttempts}`);
                    await page.evaluate(() => showWindow(5));
                    if (loginAttempt >= config.maxLoginAttempts) {
                        await browser.close()
                        return;
                    }
                }
                else {
                    console.log(`${progressBar.update(0.7)} ${username} : Successfully logged as ${accName}`);
                    isLogged = true;
                    try {
                        const currentKR = await page.evaluate((selectorCurrentKR) => {
                            return document.querySelector(selectorCurrentKR).innerText;
                        }, selectorCurrentKR);
                        console.log(`${username} : Current KR : ${currentKR}`)
                    }
                    catch (e) {
                        console.log(`currentKR e : ${e}`)
                    }
                    await checkClaim();
                }
            }
            //}
            catch (e) {
                console.log(`${username} : Failed to log in \n ${e}`);
                await browser.close()
                return;
            }
        }
    }
    //#endregion

    //#region checkClaim function
    async function checkClaim() {
        try {
            await page.evaluate(() => showWindow(14));
            await page.evaluate(() => windows[13].switchTab(1));
            const canClaim = await page.evaluate((freeSpinBanner) => {
                return document.querySelector(freeSpinBanner).innerText
            }, freeSpinBanner);
            if (canClaim.includes('Claim')) {
                console.log(`${username} : Free KR spin is available`)
                return await triggerAd()
            }
            else {
                console.log(`${username} : No free KR spin available`)
                await browser.close()
                return;
            }
        }
        catch (e) {
            console.log(`check claim e : ${e}`)
        }
    }
    //#endregion

    //#region triggerAd function
    async function triggerAd() {
        await page.evaluate(() => claimReward())
        try {
            page.on('dialog', async (dialog) => {
                console.log(`${dialog.message()}`);
                try {
                    await dialog.dismiss();
                }
                catch (e) {
                    console.log(`Alert error : ${e}`)
                    return;
                }
                if (dialog.message().includes('Spin')) { // Message Spin Error 3
                    return await browser.close();
                }
                else { // Au cas-où j'obtiens une erreur "Ad failed to laod", je relance la fonction.
                    return await triggerAd();
                }
            })
            console.log(`${progressBar.update(0.8)} Watching the ad..`)
            return await spin();

        }
        catch (e) {
            return console.log('triggerAd e' + e)
        }
    }
    //#endregion

    //#region spin function
    async function spin() {
        try {
            await page.waitForSelector(config.selector.spinWindow, { timeout: 180000 })
            await page.waitForTimeout(3000);
            await page.click(selectorSpinButton);
            console.log(`${progressBar.update(0.9)} ${username} : Spinning...`)
            await page.waitForSelector(config.selector.krLoot)
            const krLoot = await page.evaluate((selectorKRLoot) => {
                return document.querySelector(selectorKRLoot).innerText;
            }, selectorKRLoot);
            const totalKR = await page.evaluate((selectorTotalKR) => {
                return document.querySelector(selectorTotalKR).innerText;
            }, selectorTotalKR);
            console.log(`${progressBar.update(1)} ${username} won ${krLoot} - Total : ${totalKR} !`);
            return await browser.close();
        }
        catch (e) {
            console.log(`${username} : Error while spinning the wheel \n ${e}`);
            return;
        }
    }
    //#endregion

    /* NOTES
    // fenetre spin : #spinWindow
    // kr loot : #spinItemName
    // kr actuel : #spinKR
    // // kr ad : #freeKRAd
    // launch();
    //launchBrowser()
    //setInterval(init, 420000); */

}
)();
