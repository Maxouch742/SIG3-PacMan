/* Définition des variables */
let url = $('#server-url').val();

/* Fonction pour modifier l'url selon le souhait de l'utilisateur. Extrait d'un exemple et non utilisé */
url = 'http://localhost:8000';

function getData() {
    console.log("Tentative de connexion : ", url)
    $.ajax({
        url,
        type: 'GET',
        success: function(dataFromServer) {
            console.log('Réponse :', dataFromServer);
            $('#data-get').text(
                JSON.stringify(dataFromServer, undefined, 2)
            );
        }
    });
}
