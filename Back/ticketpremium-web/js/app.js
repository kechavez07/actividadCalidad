// Estado Global
const State = {
    operador: null,
    partidos: [],
    selectedMatch: null,
    selectedSeat: null,
    reservaActual: null,
    cliente: {
        cedula: '',
        nombre: '',
        montoMax: 0
    }
};

// UI Elements
const Views = {
    login: document.getElementById('view-login'),
    matches: document.getElementById('view-matches'),
    stadium: document.getElementById('view-stadium'),
    cart: document.getElementById('view-cart'),
    invoice: document.getElementById('view-invoice')
};

const switchView = (viewId) => {
    Object.values(Views).forEach(v => v.classList.add('hidden'));
    Views[viewId].classList.remove('hidden');
};

// Toggle Loader
const toggleLoader = (btnId, loading) => {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    const txt = btn.querySelector('.btn-text');
    const ldr = btn.querySelector('.loader');
    if (loading) {
        btn.disabled = true;
        txt.classList.add('hidden');
        ldr.classList.remove('hidden');
    } else {
        btn.disabled = false;
        txt.classList.remove('hidden');
        ldr.classList.add('hidden');
    }
};

// ==========================================
// 1. LOGIN
// ==========================================
document.getElementById('form-login').addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = document.getElementById('login-user').value;
    const pass = document.getElementById('login-pass').value;
    const errEl = document.getElementById('login-error');
    
    errEl.classList.add('hidden');
    toggleLoader('btn-do-login', true);
    
    try {
        const res = await SoapClient.login(user, pass);
        if (res.autenticado) {
            State.operador = user;
            document.getElementById('current-user').textContent = `Operador: ${user}`;
            document.getElementById('user-info').classList.remove('hidden');
            loadMatches();
        } else {
            errEl.textContent = res.mensaje;
            errEl.classList.remove('hidden');
        }
    } catch (err) {
        errEl.textContent = 'Error de conexión con el banco.';
        errEl.classList.remove('hidden');
    } finally {
        toggleLoader('btn-do-login', false);
    }
});

document.getElementById('btn-logout').addEventListener('click', () => {
    State.operador = null;
    document.getElementById('user-info').classList.add('hidden');
    switchView('login');
});

// ==========================================
// 2. LISTA DE PARTIDOS
// ==========================================
async function loadMatches() {
    switchView('matches');
    document.getElementById('matches-container').innerHTML = '';
    document.getElementById('matches-loader').classList.remove('hidden');

    try {
        const partidos = await SoapClient.getPartidosDisponibles();
        State.partidos = partidos;
        renderMatches(partidos);
    } catch (error) {
        alert("Error cargando partidos");
    } finally {
        document.getElementById('matches-loader').classList.add('hidden');
    }
}

function renderMatches(partidos) {
    const container = document.getElementById('matches-container');
    partidos.forEach(p => {
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `
            <div class="card-title">${p.equipoLocal} vs ${p.equipoVisita}</div>
            <div class="card-subtitle">${p.fecha}</div>
            <div class="card-detail"><span>Lugar:</span> <span>${p.lugar}</span></div>
            <div class="card-detail"><span>Código:</span> <span>${p.codigo}</span></div>
        `;
        div.addEventListener('click', () => loadStadium(p));
        container.appendChild(div);
    });
}

// ==========================================
// 3. MAPA DEL ESTADIO
// ==========================================
document.getElementById('btn-back-matches').addEventListener('click', () => {
    switchView('matches');
});

async function loadStadium(partido) {
    State.selectedMatch = partido;
    document.getElementById('stadium-match-title').textContent = `${partido.equipoLocal} vs ${partido.equipoVisita}`;
    switchView('stadium');
    
    document.getElementById('stadium-loader').classList.remove('hidden');
    document.querySelector('.stadium-map').style.display = 'none';

    try {
        // Cargar asientos de las 3 zonas en paralelo
        const [palco, tribuna, general] = await Promise.all([
            SoapClient.consultarAsientos(partido.codigo, 'PALCO'),
            SoapClient.consultarAsientos(partido.codigo, 'TRIBUNA'),
            SoapClient.consultarAsientos(partido.codigo, 'GENERAL')
        ]);
        
        // Renderizar las zonas
        renderZone('grid-palco', palco, 'PALCO');
        
        // Dividir tribuna en izquierda y derecha visualmente
        const midTribuna = Math.floor(tribuna.length / 2);
        renderZone('grid-tribuna-left', tribuna.slice(0, midTribuna), 'TRIBUNA');
        renderZone('grid-tribuna-right', tribuna.slice(midTribuna), 'TRIBUNA');
        
        renderZone('grid-general', general, 'GENERAL');

        document.querySelector('.stadium-map').style.display = 'flex';
    } catch (err) {
        alert("Error cargando el estado del estadio.");
    } finally {
        document.getElementById('stadium-loader').classList.add('hidden');
    }
}

function renderZone(containerId, asientos, localidad) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    asientos.forEach(a => {
        const div = document.createElement('div');
        div.className = `seat ${a.estado}`;
        div.title = `Asiento #${a.numeroAsiento} - ${a.estado}`;
        
        if (a.estado === 'LIBRE') {
            div.addEventListener('click', () => openReserveModal(a, localidad));
        }
        
        container.appendChild(div);
    });
}

// ==========================================
// 4. MODAL RESERVA Y VALIDACIÓN
// ==========================================
function openReserveModal(asiento, localidad) {
    State.selectedSeat = { ...asiento, codigoLocalidad: localidad };
    document.getElementById('reserve-seat-info').textContent = 
        `Asiento #${asiento.numeroAsiento} - ${localidad}`;
    
    document.getElementById('res-cedula').value = '';
    document.getElementById('res-nombre').value = '';
    document.getElementById('reserve-error').classList.add('hidden');
    document.getElementById('reserve-success').classList.add('hidden');
    
    document.getElementById('modal-reserve').classList.remove('hidden');
}

document.getElementById('btn-close-reserve').addEventListener('click', () => {
    document.getElementById('modal-reserve').classList.add('hidden');
});

document.getElementById('form-reserve').addEventListener('submit', async (e) => {
    e.preventDefault();
    const cedula = document.getElementById('res-cedula').value;
    const nombre = document.getElementById('res-nombre').value;
    const errEl = document.getElementById('reserve-error');
    
    errEl.classList.add('hidden');
    toggleLoader('btn-do-reserve', true);
    
    try {
        // 1. Verificar Crédito
        const credRes = await SoapClient.verificarSujetoCredito(cedula);
        if (!credRes.aptoParaCredito) {
            errEl.textContent = `Crédito Rechazado: ${credRes.mensaje}`;
            errEl.classList.remove('hidden');
            toggleLoader('btn-do-reserve', false);
            return;
        }

        // 2. Obtener Monto Máximo
        const maxRes = await SoapClient.obtenerMontoMaximo(cedula);
        State.cliente = { cedula, nombre, montoMax: maxRes.montoMaximoAprobado };

        // 3. Reservar Asiento
        const resRes = await SoapClient.reservarAsiento(
            State.selectedMatch.codigo,
            State.selectedSeat.codigoLocalidad,
            State.selectedSeat.numeroAsiento,
            cedula,
            nombre
        );

        if (resRes.success) {
            State.reservaActual = resRes.mensaje;
            document.getElementById('modal-reserve').classList.add('hidden');
            loadCart();
        } else {
            errEl.textContent = resRes.mensaje;
            errEl.classList.remove('hidden');
        }

    } catch (err) {
        errEl.textContent = "Error en el proceso de reserva.";
        errEl.classList.remove('hidden');
    } finally {
        toggleLoader('btn-do-reserve', false);
    }
});

// ==========================================
// 5. CARRITO Y CHECKOUT
// ==========================================
function loadCart() {
    switchView('cart');
    document.getElementById('cart-match').textContent = `${State.selectedMatch.equipoLocal} vs ${State.selectedMatch.equipoVisita}`;
    document.getElementById('cart-seat').textContent = `${State.selectedSeat.codigoLocalidad} - Asiento #${State.selectedSeat.numeroAsiento}`;
    
    // Asignar precios fijos según DB sembrada (o se podría buscar del endpoint localidades)
    let price = 0;
    if (State.selectedSeat.codigoLocalidad === 'PALCO') price = 300;
    if (State.selectedSeat.codigoLocalidad === 'TRIBUNA') price = 150;
    if (State.selectedSeat.codigoLocalidad === 'GENERAL') price = 80;
    
    State.selectedSeat.precio = price;
    document.getElementById('cart-price').textContent = `$${price.toFixed(2)}`;
    
    document.getElementById('cart-client-name').textContent = State.cliente.nombre;
    document.getElementById('cart-client-cedula').textContent = State.cliente.cedula;
    document.getElementById('cart-monto-max').textContent = `$${State.cliente.montoMax.toFixed(2)}`;
}

document.getElementById('btn-cancel-reserve').addEventListener('click', async () => {
    try {
        await SoapClient.liberarAsiento(
            State.selectedMatch.codigo,
            State.selectedSeat.codigoLocalidad,
            State.selectedSeat.numeroAsiento,
            State.cliente.cedula
        );
        loadStadium(State.selectedMatch);
    } catch(e) {
        alert("Error liberando el asiento.");
    }
});

document.getElementById('form-checkout').addEventListener('submit', async (e) => {
    e.preventDefault();
    const plazo = parseInt(document.getElementById('checkout-plazo').value);
    const errEl = document.getElementById('checkout-error');
    errEl.classList.add('hidden');
    toggleLoader('btn-do-checkout', true);
    
    try {
        // 1. Confirmar Compra
        const facturaId = `FACT-${Date.now()}`;
        const confRes = await SoapClient.confirmarCompraAsiento(
            State.selectedMatch.codigo,
            State.selectedSeat.codigoLocalidad,
            State.selectedSeat.numeroAsiento,
            State.cliente.cedula,
            facturaId
        );

        if (!confRes.success) {
            throw new Error(confRes.mensaje);
        }

        // 2. Registrar Crédito y Amortización
        const credRes = await SoapClient.registrarCreditoAmortizacion(
            State.cliente.cedula,
            State.selectedSeat.precio,
            plazo
        );

        if (!credRes.aprobado) {
            throw new Error(credRes.mensaje);
        }

        // 3. Mostrar Factura
        showInvoice(facturaId, State.selectedSeat.precio, plazo, credRes.tablaAmortizacion);

    } catch (err) {
        errEl.textContent = err.message || "Error procesando la compra.";
        errEl.classList.remove('hidden');
    } finally {
        toggleLoader('btn-do-checkout', false);
    }
});

// ==========================================
// 6. FACTURA Y AMORTIZACIÓN
// ==========================================
function showInvoice(facturaId, monto, plazo, tabla) {
    switchView('invoice');
    document.getElementById('invoice-id').textContent = facturaId;
    document.getElementById('invoice-monto').textContent = `$${monto.toFixed(2)}`;
    document.getElementById('invoice-plazo').textContent = plazo;
    
    const tbody = document.getElementById('amortization-body');
    tbody.innerHTML = '';
    
    tabla.forEach(c => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${c.numeroCuota}</td>
            <td>$${c.valorCuota.toFixed(2)}</td>
            <td>$${c.capitalPagado.toFixed(2)}</td>
            <td>$${c.interesPagado.toFixed(2)}</td>
            <td>$${c.saldo.toFixed(2)}</td>
        `;
        tbody.appendChild(tr);
    });
}

document.getElementById('btn-go-home').addEventListener('click', () => {
    loadMatches();
});
