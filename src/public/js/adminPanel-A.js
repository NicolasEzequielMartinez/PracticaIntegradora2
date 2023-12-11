const socket = io();
const botomStore = document.getElementById("storeButtonPrem")
async function saludoYAccesoPrem() {
    try {
        const sessionResponse = await fetch('/api/sessions/current', {
            method: 'GET',
        });
        if (sessionResponse.redirected) {
            let invalidTokenURL = sessionResponse.url;
            window.location.replace(invalidTokenURL);
        };
        const sessionRes = await sessionResponse.json();
        if (sessionRes.statusCode === 401) {
            Swal.fire({
                title: sessionRes.h1,
                text: sessionRes.message,
                imageUrl: sessionRes.img,
                imageWidth: 70,
                imageHeight: 70,
                imageAlt: sessionRes.h1,
            });
        } else {
            if (sessionRes.role === "admin") {
                let botnPrem = ""
                botnPrem += `<a href="/storeProducts"><img src="https://i.ibb.co/Ptq3Y46/tienda.png" alt="login" border="0" class="logoS"></a>`
                botomStore.innerHTML = botnPrem;
            }
            setTimeout(() => {
                const saludoYaMostrado = localStorage.getItem('saludoMostrado');
                if (saludoYaMostrado === 'false') {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Bienvenido!',
                        text: `Hola ${sessionRes.name}, has iniciado sesión con éxito.`,
                    });
                    localStorage.setItem('saludoMostrado', 'true');
                }
            }, 600);
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error en la solicitud de obtener datos del usuario',
            text: 'Error: ' + error.message
        });
    };
};
saludoYAccesoPrem();
const tableProd = document.getElementById('tableProd');
let totalDocs;
function allProducts() {
    socket.on("products", (productsResponse) => {
        if (productsResponse.statusCode === 200) {
            let htmlProductos = "";
            htmlProductos += `
            <thead>
                <tr>
                    <th>Modelo</th>
                    <th>Descripción</th>
                    <th>Img 1</th>  
                    <th>Img 2</th> 
                    <th>Stock</th>
                    <th>Precio</th>
                    <th>Owner Product</th>
                </tr>
            </thead>`;
            productsResponse.result.docs.forEach((product) => {
                let owner;
                if (product.owner === "admin") {
                    owner = `
                    <div style = "display: flex; justify-content: center; align-items: center; flex-direction: column; gap: 2.5em;" >
                        <h2>Admin</h2> 
                    </div>`
                } else if (product.email !== null) {
                    owner = `
                    <div style = "display: flex; justify-content: center; align-items: center; flex-direction: column; gap: 1em;">
                        <div>
                            <h2 style="font-size: 1em !important;">User ID: ${product.owner}</h2>
                        </div>  
                        <div>
                            <h2 style="font-size: 1em !important;">${product.email}</h2>
                        </div>
                        <div>
                            <button id="deleteUserProd${product._id}" class="botonB" style="height: 4em; font-size: 0.9em; width: 13em; padding: 0.5em 0em;">
                                <h2>Eliminar producto del usuario</h2>
                            </button>
                        </div>
                    </div> `
                }
                htmlProductos += `
                <tr>
                    <td id="${product.title}">${product.title}</td>
                    <td class="description">${product.description}</td>
                    <td><img src="${product.img1.reference}" alt="${product.title}" class="Imgs"></td>
                    <td><img src="${product.img2.reference}" alt="${product.title}" class="Imgs"></td>
                    <td>${product.stock} Und.</td>
                    <td>$${product.price}</td>
                    <td> ${owner}</td>
                </tr>`;
            });
            tableProd.innerHTML = htmlProductos;
            productsResponse.result.docs.forEach((product) => {
                if (product.role === "premium") {
                    const deleteUserProd = document.getElementById(`deleteUserProd${product._id}`);
                    const titleElement = document.getElementById(`${product.title}`);
                    const title = titleElement.textContent;
                    deleteUserProd.addEventListener('click', () => {
                        deleteUserPid(product._id, title);
                    });
                };
            });
            totalDocs = productsResponse.result.totalDocs;
            const Pags = document.getElementById('Pags');
            const hasPrevPage = productsResponse.result.hasPrevPage;
            const currentPage = productsResponse.result.page;
            const hasNextPage = productsResponse.result.hasNextPage;
            let htmlPag = "";
            htmlPag +=
                `<button class="boton" id="Prev">Prev</button>
                <h2 class="pag pagNumber" id="numberPag">${currentPage}</h2>
                <button class="boton" id="Next">Next</button>`;
            Pags.innerHTML = htmlPag;
            const prevButton = document.getElementById('Prev');
            const nextButton = document.getElementById('Next');
            prevButton.addEventListener('click', (e) => {
                e.preventDefault();
                if (hasPrevPage === true) {
                    cambiarPagina(currentPage, "prev");
                }
            });
            nextButton.addEventListener('click', (e) => {
                e.preventDefault();
                if (hasNextPage === true) {
                    cambiarPagina(currentPage, "next");
                }
            })
        } else if (productsResponse.statusCode === 400) {
            Swal.fire({
                icon: 'warning',
                title: 'Filtro no válido',
                text: productsResponse.message
            });
        } else if (productsResponse.statusCode === 404) {
            Swal.fire({
                icon: 'warning',
                title: `${productsResponse.message}`,
                text: "No se encontraron productos que coincidan con la búsqueda."
            });
        } else if (productsResponse.statusCode === 500) {
            Swal.fire({
                icon: 'warning',
                title: 'Error al intentar obtener los productos',
                text: productsResponse.message
            });
        };
    })
}
allProducts()

async function deleteUserPid(pid, title) {
    const response = await fetch('/api/sessions/current', {
        method: 'GET',
    })
    if (response.redirected) {
        let invalidTokenURL = response.url;
        window.location.replace(invalidTokenURL);
    };
    const res = await response.json();
    if (res.statusCode === 401) {
        Swal.fire({
            title: res.h1,
            text: res.message,
            imageUrl: res.img,
            imageWidth: 70,
            imageHeight: 70,
            imageAlt: res.h1,
        });
    } else {
        const deleteResponse = await fetch(`/api/products/${pid}`, {
            method: 'DELETE',
        })
        if (deleteResponse.redirected) {
            let invalidTokenURL = deleteResponse.url;
            window.location.replace(invalidTokenURL);
        };
        const deleteRes = await deleteResponse.json();
        if (deleteRes.statusCode === 401) {
            Swal.fire({
                title: deleteRes.h1,
                text: deleteRes.message,
                imageUrl: deleteRes.img,
                imageWidth: 70,
                imageHeight: 70,
                imageAlt: deleteRes.h1,
            });
        } else {
            const statusCodeRes = deleteRes.statusCode;
            const messageRes = deleteRes.message;
            const customError = deleteRes.cause;
            if (statusCodeRes === 200) {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 5000,
                    title: `${title} de usuario premium eliminado con éxito.`,
                    icon: 'success'
                });
            } else if (customError || statusCodeRes === 404 || statusCodeRes === 403) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Error al intentar eliminar producto del usuario premium',
                    text: customError || messageRes
                });
            } else if (statusCodeRes === 500) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al intentar eliminar producto del usuario premium',
                    text: messageRes
                });
            };
        };
    };
};

let logout = document.getElementById("logoutAdmin")
logout.addEventListener('click', () => {
    logoutF();
});

async function logoutF() {
    const response = await fetch('/api/sessions/logout', {
        method: 'POST',
    })
    if (response.redirected) {
        let invalidTokenURL = response.url;
        window.location.replace(invalidTokenURL);
    };
    const res = await response.json();
    if (res.statusCode === 401) {
        Swal.fire({
            title: res.h1,
            text: res.message,
            imageUrl: res.img,
            imageWidth: 70,
            imageHeight: 70,
            imageAlt: res.h1,
        });
    } else {
        const statusCode = res.statusCode;
        const message = res.message;
        const customError = res.message;
        if (statusCode === 200) {
            Swal.fire({
                icon: 'success',
                title: 'Logout',
                text: message || 'La session se ha cerrado exitosamente',
            });
            setTimeout(() => {
                window.location.replace('/login');
            }, 2000);
        }  else if (statusCode === 500) {
            Swal.fire({
                icon: 'error',
                title: 'Error al intentar cerrar session',
                text: message || 'Hubo un problema al intentar cerrar la session.',
            });
        };
    };
};

let limit;
let page;
let sort;
let filtro;
let filtroVal;

function filtrarProducts(limit, page, sort, filtro, filtroVal) {
    const busquedaProducts = {
        limit: limit || 10,
        page: page || 1,
        sort: sort || 1,
        filtro: filtro || null,
        filtroVal: filtroVal || null,
    }
    socket.emit('busquedaFiltrada', busquedaProducts);
};

const all = document.getElementById("All")
all.addEventListener('click', () => {
    filtro = "";
    filtroVal = "";
    filtrarProducts(limit, page, sort, filtro, filtroVal);
});

const adminProd = document.getElementById("soloAdmin")
adminProd.addEventListener('click', () => {
    filtro = "owner";
    filtroVal = "admin";
    filtrarProducts(limit, page, sort, filtro, filtroVal);
});

const userProd = document.getElementById("soloUsers")
userProd.addEventListener('click', () => {
    filtro = "role";
    filtroVal = "premium";
    filtrarProducts(limit, page, sort, filtro, filtroVal);
});

const motor = document.getElementById("Motor")
motor.addEventListener('click', () => {
    filtro = "category";
    filtroVal = "Motor";
    filtrarProducts(limit, page, sort, filtro, filtroVal);
});

const electricidad = document.getElementById("Electricidad")
electricidad.addEventListener('click', () => {
    filtro = "category";
    filtroVal = "Electricidad";
    filtrarProducts(limit, page, sort, filtro, filtroVal);
});

const limpieza = document.getElementById("Limpieza")
limpieza.addEventListener('click', () => {
    filtro = "category";
    filtroVal = "Limpieza";
    filtrarProducts(limit, page, sort, filtro, filtroVal);
});

const frenos = document.getElementById("Frenos")
frenos.addEventListener('click', () => {
    filtro = "category";
    filtroVal = "Frenos";
    filtrarProducts(limit, page, sort, filtro, filtroVal);
});

const carroceria = document.getElementById("Carroceria")
carroceria.addEventListener('click', () => {
    filtro = "category";
    filtroVal = "Carroceria";
    filtrarProducts(limit, page, sort, filtro, filtroVal);
});

const suspension = document.getElementById("Suspension")
suspension.addEventListener('click', () => {
    filtro = "category";
    filtroVal = "Suspension";
    filtrarProducts(limit, page, sort, filtro, filtroVal);
});

const menorPrice = document.getElementById("MenorPre")
menorPrice.addEventListener('click', () => {
    sort = "1";
    filtrarProducts(limit, page, sort, filtro, filtroVal);
});

const mayorPrice = document.getElementById("MayorPre")
mayorPrice.addEventListener('click', () => {
    sort = "-1";
    filtrarProducts(limit, page, sort, filtro, filtroVal);
});

// Limit: 
const limitInput = document.getElementById("limit");
limitInput.addEventListener('input', () => {
    limit = limitInput.value
    filtrarProducts(limit, page, sort, filtro, filtroVal);
})

const limpiarFiltros = document.getElementById("Limpiar");
limpiarFiltros.addEventListener('click', () => {
    limitInput.value = "";
    limit = 10;
    page = 1;
    sort = 1;
    filtro = null;
    filtroVal = null;
    filtrarProducts(limit, page, sort, filtro, filtroVal);
});

function cambiarPagina(currentPage, newPage) {
    let newCurrentPage;
    if (newPage === "prev") {
        newCurrentPage = currentPage - 1;
    }
    if (newPage === "next") {
        newCurrentPage = currentPage + 1;
    }
    filtrarProducts(limit, newCurrentPage, sort, filtro, filtroVal);
};