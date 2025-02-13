// Objeto de recursos da aplicação
var app = new Object();

// Versão aplicação
app.version = "1.0.1";

// Usuário atendente
app.user = {};

// Ponto de venda do atendimento
app.store = {};

app.launcher = function() {
    // Inicializa os componentes da aplicação
    checkbox.setup("Privacy");
    // Formata os campos com máscara
    mask.put("ISearch", mask.phone);
    mask.put("Phone", mask.phone);
    mask.put("CPF", mask.cpf);
    // Inclui os eventos dos botões
    document.getElementById("Insert").addEventListener("click", function() { app.send(); });
    document.getElementById("Search").addEventListener("click", function() { app.search(); });
    document.getElementById("ISearch").addEventListener("keydown", function(e) {
        switch(e.keyCode) {
            case 9:     // Evento da tecla "Tab"
                // Cancela o evento padrão da tecla
                e.preventDefault();
                break;
            case 13:    // Evento da tecla "Enter"
                e.preventDefault();
                if (this.value.length >= 10) {
                    app.search();
                };
                break;
            case 27:    // Evento da tecla "Esc"
            case 38:    // Evento da tecla "Seta para cima"
            case 40:    // Evento da tecla "Seta para baixo"
                // Cancela o evento padrão da tecla
                e.preventDefault();
                break;
            default:    // Evento de outras teclas
              break;
        }
    });
    // Inicializa os componentes de primeiro plano
    loader.build();
    // Obtem as credenciais do usuário
    const { search } = window.location;
    const params = new URLSearchParams(search);
    const hash = params.get('hash');
    if (hash == null) {
        app.error("Não foi possivel identificar o atendente e o ponto de venda.");
    } else {
        const path = "https://api.lubraxmaissystem.com/Lubrax.Mais.Api/api/Public/" + hash;
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
                app.error();
            };
            return response.json();
        })
        .catch(error => { snackbar.show(error.message.text); })
        .finally(() => { loader.hide(); });
        // Finaliza a inicialização da aplicação
        console.log("Lubrax Mais Web - Cadastro Fácil" + "\n" + "Versão: " + app.version + " (Release) " + "\n\n");
    };
}

app.error = function(msg) {
    document.getElementById("Content").classList.add("hidden");
    document.getElementById("Failure").classList.remove("hidden");
    if (msg != null && msg != undefined && msg != "") {
        console.log(msg);
    };
};

app.search = async function() {
    var phone = document.getElementById("ISearch").value;
    if (phone.length == 14 || phone.length == 15) {
        await controller.phone(phone);
    } else if (phone.length == 10) {
        // Tenta formatar um numero de telefone com 10 dígitos
        let fix = "(" + phone.substring(0, 2) + ") " + phone.substring(2, 6) + "-" + phone.substring(6);
        if (fix.length == 14) {
            await controller.phone(fix);
        };
    } else if (phone.length == 11) {
        // Tenta formatar um numero de telefone com 11 dígitos
        let mobile = "(" + phone.substring(0, 2) + ") " + phone.substring(2, 7) + "-" + phone.substring(7);
        if (mobile.length == 15) {
            await controller.phone(mobile);
        };
    } else {
        snackbar.show("Informe um número de telefone válido");
    };
};

app.send = async function() {
    var name = document.getElementById("Name").value;
    var phone = document.getElementById("Phone").value;
    var email = document.getElementById("Email").value;
    if (name.length == 0) {
        snackbar.show("Informe seu nome completo");
        return;
    } else {
        if (phone.length == 0) {
            snackbar.show("Informe seu número de telefone");
            return;
        } else {
            if (email.length == 0) {
                snackbar.show("Informe seu endereço de e-mail");
                return;
            } else {
                let lead = {
                    name: name,
                    phone: phone,
                    email: email,
                    registration: {
                        label: "CPF",
                        value: document.getElementById("CPF").value
                    },
                    privacy: {
                        advice: checkbox.checked("PrivacyAdvice"),
                        sms: checkbox.checked("PrivacySMS"),
                        whatsapp: checkbox.checked("PrivacyWhatsapp"),
                        email: checkbox.checked("PrivacyEmail")
                    }
                };
                await controller.lead(lead);
            };
        };
    };
};

// Objeto de recursos de comunicação
var controller = new Object();

controller.phone = async function(phone) {
    const path = "https://api.lubraxmaissystem.com/Lubrax.Mais.Api/api/Public/leads/getByPhone/" + phone;
    const make = {
        method: 'GET',
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
            'data-culture': 'pt-BR',
            'data-store-key': store.key,
        }
    };
    loader.show("Verificando número de telefone...");
    fetch(path, make)
    .then(async response => {
        if (response.ok == true) {
            if (response.status === 200) {
                const data = await response.json();
                document.getElementById("Name").value = data[0].name;
                document.getElementById("Phone").value = data[0].phone;
                document.getElementById("CPF").value = data[0].registration.value;
                document.getElementById("Email").value = data[0].email;
                checkbox.state("PrivacyAdvice", data[0].privacy.advice);
                checkbox.state("PrivacySMS", data[0].privacy.sms);
                checkbox.state("PrivacyWhatsapp", data[0].privacy.whatsapp);
                checkbox.state("PrivacyEmail", data[0].privacy.email)
            };
            if (response.status === 204) {
                document.getElementById("Phone").value = phone;
            };
            document.getElementById("Find").classList.add("hidden");
            document.getElementById("Lead").classList.remove("hidden");
            document.getElementById("Message").classList.add("hidden");
            document.getElementById("Insert").classList.remove("hidden");
            return;
        } else {
            app.error();
        };
        return response.json();
    })
    .catch(error => {
        app.error();
        console.log(error.message.text);
    })
    .finally(() => { loader.hide(); });
};

controller.lead = async function(lead) {
    const path = "https://api.lubraxmaissystem.com/Lubrax.Mais.Api/api/Public/leads/insert?app=9";
    const make = {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
            'data-culture': 'pt-BR',
            'userKey': user.key,
            'data-store-key': store.key
        },
        body: JSON.stringify(lead)
    };
    loader.show("Enviando...");
    fetch(path, make)
    .then(async response => {
        if (response.ok == true) {
            const data = await response.json();
            if (response.status === 201) {
                console.log(data);
            };
            document.getElementById("Find").classList.add("hidden");
            document.getElementById("Lead").classList.add("hidden");
            document.getElementById("Done").classList.remove("hidden");
            return;
        } else {
            app.error();
        };
        return response.json();
    })
    .catch(error => {
        app.error();
        console.log(error.message.text);
    })
    .finally(() => { loader.hide(); });
}