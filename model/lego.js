import { db } from '../db/db.js';

/**
 * Retourne l'ensemble des échanges.
 * @returns L'ensemble des échanges avec les informations de l'utilisateur.
 */
export async function getAllExchanges() {
    const exchanges = await db.all(`
        SELECT e.id_echange AS id, e.nom_echange, u.nom AS user_name, u.prenom AS user_firstname 
        FROM echange e
        JOIN utilisateur u ON e.id_utilisateur = u.id_utilisateur;
    `);
    return exchanges;
}

/**
 * Retourne les échanges d'un utilisateur spécifique.
 * @param {number} userId Identifiant de l'utilisateur.
 * @returns Les échanges de l'utilisateur.
 */
export async function getUserExchanges(userId) {
    const exchanges = await db.all(`
        SELECT e.id_echange, e.nom_echange, u.nom_utilisateur 
        FROM echange e
        JOIN utilisateur u ON e.id_utilisateur = u.id_utilisateur
        WHERE e.id_utilisateur = ?;
    `, [userId]);
    return exchanges;
}


/**
 * Supprime un échange spécifique.
 * @param {number} exchangeId Identifiant de l'échange à supprimer.
 */
export async function deleteExchange(exchangeId) {
    await db.run(`
        DELETE FROM echange
        WHERE id_echange = ?;
    `, [exchangeId]);
}

/**
 * Crée un nouvel échange avec des briques spécifiées.
 * @param {string} exchangeName Nom de l'échange.
 * @param {Array} bricks Tableau d'objets représentant les briques (id_brique, quantite).
 * @param {number} userId Identifiant de l'utilisateur (par défaut 1).
 * @returns L'identifiant de l'échange créé.
 */
export async function createExchange(exchangeName, bricks, userId) { 
    const result = await db.run(`
        INSERT INTO echange (nom_echange, id_utilisateur) VALUES (?, ?);
    `, [exchangeName, userId]);

    const exchangeId = result.lastID;

    for (const brique of bricks) {
        await db.run(`
            INSERT INTO echange_brique (id_echange, id_brique, quantite) VALUES (?, ?, ?);
        `, [exchangeId, brique.id, brique.quantite]);
        console.log("Brique insérée dans echange_brique:", { id_echange: exchangeId, id_brique: brique.id, quantite: brique.quantite });
    }

    return exchangeId;
}

/**
 * Retourne les détails d'un échange spécifique.
 * @param {number} exchangeId Identifiant de l'échange.
 * @returns Les détails de l'échange, les briques et la valeur totale.
 */
export async function getExchangeDetails(exchangeId) {
    const exchange = await db.get(`
        SELECT e.nom_echange, u.nom AS user_name, u.prenom AS user_firstname 
        FROM echange e
        JOIN utilisateur u ON e.id_utilisateur = u.id_utilisateur
        WHERE e.id_echange = ?;
    `, [exchangeId]);

    console.log("Détails d'échange:", exchange);

    if (!exchange) throw new Error('Echange non trouvé');

    const bricks = await db.all(`
        SELECT b.nom, b.valeur, eb.quantite 
        FROM echange_brique eb
        JOIN brique b ON eb.id_brique = b.id_brique
        WHERE eb.id_echange = ?;
    `, [exchangeId]);

    console.log("Bricks récupérés:", bricks);

    const totalValue = bricks.reduce((sum, brick) => sum + brick.valeur * brick.quantite, 0);

    console.log("Valeur totale:", totalValue);

    return { exchange, bricks, totalValue };
}

/**
 * Valide les données d'un échange.
 * @param {string} exchangeName Nom de l'échange.
 * @param {Array} bricks Tableau de briques avec leurs quantités.
 * @throws {Error} Si les données sont invalides.
 */
export function validateExchangeData(exchangeName, bricks) {
    if (!exchangeName || typeof exchangeName !== 'string' || exchangeName.trim() === '') {
        throw new Error('Exchange name is required and must be a non-empty string');
    }

    if (!Array.isArray(bricks) || bricks.some(brick => brick.quantite <= 0 || !Number.isInteger(brick.quantite))) {
        throw new Error('Bricks array must contain valid quantities');
    }
}
