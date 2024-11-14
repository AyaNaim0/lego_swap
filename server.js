// Aller chercher les configurations de l'application 
import 'dotenv/config';

// Importer les fichiers et librairies
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import express, { json } from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import { engine } from 'express-handlebars';
import { getAllExchanges, getExchangeDetails, createExchange, deleteExchange } from './model/lego.js';

// Création du serveur
const app = express();

// Ajout des engins au serveur
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

// Ajout de middlewares
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(json());
app.use(express.static('public'));

// Programmation de routes

// Route pour la page d'accueil affichant les échanges
app.get('/', async (req, res) => {
    const exchanges = await getAllExchanges();
    res.render('lego', {
        titre: 'Accueil | Echanges',
        styles: ['/css/style.css'],
        scripts: ['/js/lego.js'],
        exchanges: exchanges
    });
});

// Route pour la page des échanges
app.get('/exchanges', async (req, res) => {
    const exchanges = await getAllExchanges();
    res.render('lego-echange', {
        titre: "Page d'echange",
        styles: ['/css/styles.css'],
        scripts: ['/js/lego.js'],
        exchanges: exchanges
    });
});

// Route pour la page des détails d'un échange spécifique
app.get('/details/:id', async (req, res) => {
    const exchangeId = req.params.id;
    const exchangeDetails = await getExchangeDetails(exchangeId);
    if (exchangeDetails) {
        res.render('echange-details', {
            titre: 'Détails de l\'échange',
            styles: ['/css/style.css'],
            exchange: exchangeDetails.exchange,
            bricks: exchangeDetails.bricks,
            totalValue: exchangeDetails.totalValue
        });
    } else {
        res.status(404).send("Échange non trouvé");
    }
});

// Route pour la page "À propos"
app.get('/apropos', (req, res) => {
    res.render('apropos', {
        titre: 'À propos | Echanges',
        styles: ['/css/style.css']
    });
});

// API route pour créer un échange
app.post('/api/exchange', async (req, res) => {
    const exchangeId = await createExchange(req.body.nom_echange, req.body.briques, req.body.userId || 1);
    res.status(201).json({ id: exchangeId });
});



// API route pour supprimer un échange
app.delete('/api/exchange/:id', async (req, res) => {
    const exchangeId = req.params.id;
    try {
        await deleteExchange(exchangeId);
        res.status(200).send({ message: "Échange supprimé avec succès." });
    } catch (error) {
        console.error(error); 
        res.status(500).send({ message: "Erreur lors de la suppression de l'échange." });
    }
});

// Démarrage du serveur
app.listen(process.env.PORT);
console.info(`Serveur démarré:`);
console.info(`http://localhost:${ process.env.PORT }`);
