// Fonction pour augmenter la quantité dans le champ spécifié
function incrementQuantity(id) {
    const quantityInput = document.getElementById(id);
    let currentValue = parseInt(quantityInput.value) || 0;
    currentValue++;
    quantityInput.value = currentValue;
}

// Fonction pour diminuer la quantité dans le champ spécifié
function decrementQuantity(id) {
    const quantityInput = document.getElementById(id);
    let currentValue = parseInt(quantityInput.value) || 0;
    if (currentValue > 0) {
        currentValue--;
    }
    quantityInput.value = currentValue;
}

// Attacher les événements aux boutons de suppression lors du chargement de la page
document.addEventListener("DOMContentLoaded", () => {
    const deleteButtons = document.querySelectorAll(".delete-button");
    deleteButtons.forEach(button => {
        button.addEventListener("click", function () {
            const exchangeItem = this.closest(".exchange-item");
            const exchangeId = exchangeItem.getAttribute("data-id"); // Utiliser data-id pour récupérer l'identifiant
            deleteExchange(exchangeId);
        });
    });
});

// Fonction de suppression d'un échange
async function deleteExchange(exchangeId) {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet échange ?")) {
        const response = await fetch(`/api/exchange/${exchangeId}`, { method: 'DELETE' });

        if (response.ok) {
            alert("Échange supprimé avec succès !");
            document.querySelector(`.exchange-item[data-id="${exchangeId}"]`).remove();
        } else {
            alert("Erreur lors de la suppression de l'échange.");
        }
    }
}

// Fonction pour valider et soumettre le formulaire d'échange
async function validateAndSubmitExchange(event) {
    event.preventDefault();

    const exchangeName = document.getElementById('exchange-name').value.trim();
    const brickQuantities = document.querySelectorAll('.quantity-display');
    let isEmptyExchange = true;
    const bricksData = [];

    brickQuantities.forEach(input => {
        const quantity = parseInt(input.value) || 0;
        const id_brique = input.id;
        if (quantity > 0) {
            isEmptyExchange = false;
            bricksData.push({ id_brique: parseInt(id_brique), quantite: quantity });
        }
    });

    if (!exchangeName) {
        alert("Veuillez entrer le nom de l'échange.");
        return;
    }

    if (isEmptyExchange) {
        alert("Veuillez ajouter au moins une brique à l'échange.");
        return;
    }

    const response = await fetch('/api/exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            nom_echange: exchangeName,
            briques: bricksData,
            userId: 1 
        })
    });

    if (response.ok) {
        alert("Échange créé avec succès !");
        document.getElementById('echange-form').reset();
        brickQuantities.forEach(input => input.value = '0');
    } else {
        alert("Il y a eu une erreur lors de la création de l'échange.");
    }
}

// Attacher la fonction validateAndSubmitExchange à la soumission du formulaire
document.getElementById('echange-form').addEventListener('submit', validateAndSubmitExchange);
