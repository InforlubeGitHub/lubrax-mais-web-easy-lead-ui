// Objeto de recursos da aplicação
var app = new Object();

// Versão aplicação
app.version = "1.0.1";

// Usuário atendente
app.user = {};

// Ponto de venda do atendimento
app.store = {};

app.launcher = function() {
    checkbox.setup("Privacy");
    // Inicializa os componentes globais da aplicação
    document.getElementById("Search").addEventListener("click", function() { console.log("Pesquisar"); });
    document.getElementById("Insert").addEventListener("click", function() { console.log("Cadastrar"); });
    document.getElementById("Update").addEventListener("click", function() { console.log("Atualizar"); });
    // Inicializa os componentes de primeiro plano
    loader.build();
    // Obtem as credenciais do usuário
    const { search } = window.location;
    const params = new URLSearchParams(search);
    const hash = params.get('hash');
    const path = "https://api.lubraxmaissystem.com/Lubrax.Mais.Api/api/User/" + hash;
    const make = {
        method: 'GET',
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
            'data-culture': 'pt-BR'
        }
    };
    loader.show("Localizando o ponto de venda");
    fetch(path, make)
    .then(async response => {
        if (response.ok == true) {
            const data = await response.json();
            user = data.user;
            store = data.store;
            document.getElementById("User").innerText = data.user.name;
            document.getElementById("Store").innerText = data.store.name;
            return;
        } else {
            if (response.status >= 400 && response.status <= 499) {
                console.log("Erro")
                return;
            }
        };
        return response.json();
    })
    .catch(error => { snackbar.show(error.message.text); })
    .finally(() => { loader.hide(); });
    // Finaliza a inicialização da aplicação
    console.log("Lubrax Mais Web - Cadastro Fácil" + "\n" + "Versão: " + app.version + " (Release) " + "\n\n");
}

// Objeto de recursos de comunicação
var host = new Object();