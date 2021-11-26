const config = {
    version: 'v1.0', // # Version du programme
    debugMode: true, // # True pour activer le débug mode (screenshots activés) / false pour désactiver.
    maxLoginAttempts: 3, // # Tentative maximum de connexion à notre compte sur le jeu.
    retryMax: 3, // # Tentative maximum de connexion à l'URL -> une fois dépassé le programme s'interrompt.
    URL: 'https://krunker.io/', // # URL du jeu.
    proxies: ['47.88.17.124:1085', '182.253.60.170:8083', '47.88.17.124:1085', '182.253.60.170:8083',], // # Liste de proxy, non disponible dans cette version.
    
    // #region Don't touch below if you don't know what you are doing.
    selector: {
      cookies: '#onetrust-accept-btn-handler', // # Selector du bouton des cookies
      usernameField: '#accName', // # Selector du champ de username
      passwordField: '#accPass', // # Selector du champ de password
      errorMessage: "#instructionsUpdate > div", // # Selector des messages d'erreurs
      currentKR: '#menuKRCount', // # Sélector du nombre de KR actuel
      freeSpinBanner: '#menuWindow > div > div:nth-child(5) > div > div', // # Selector de la bannière "free KR"
      spinWindow: '#spinWindow', // # Sélector de la fenêtre de spin
      spinButton: '#spinButton', // # Selector du bouton de spin
      krLoot: '#spinItemName', // # Selector du gain en KR obtenu après avoir lancé la roue
      totalKR: '#spinKR', // # Selector du nouveau nombre de KR après avoir lancé la roue
    },
    path: {
      accountList: 'config/accountList.json', // # Chemin vers la liste des comptes.
    }
    // #endregion
   };
   
   module.exports = config;