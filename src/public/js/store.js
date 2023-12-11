const publicarBtn = document.getElementById('publicarBtn')

async function volver() {
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
        let role = sessionRes.role;
        let btnVolver = document.getElementById("volverStore");
        if (role === "admin") {
            btnVolver.href = '/adminPanel';
        } else {
            btnVolver.href = '/products';
        }
    }
}
volver()

async function publicar() {
    const model = document.querySelector('input[name="model"]').value;
    const description = document.querySelector('input[name="description"]').value;
    const code = document.querySelector('input[name="code"]').value;
    const price = document.querySelector('input[name="price"]').value;
    const stock = document.querySelector('input[name="stock"]').value;
    const category = document.querySelector('input[name="category"]').value;
    const img1File = document.querySelector('input[name="img1"]').files[0];
    const img2File = document.querySelector('input[name="img2"]').files[0];
    const formData = new FormData();
    formData.append('title', model);
    formData.append('description', description);
    formData.append('code', code);
    formData.append('price', parseInt(price, 10));
    formData.append('stock', parseInt(stock, 10));
    formData.append('category', category);
    formData.append('Img1', img1File);
    formData.append('Img2', img2File);
    if (!model || !description || !code || !price || !stock || !category || !img1File || !img2File) {
        let incomplete = "";
        if (!model) {
            incomplete += "Modelo, ";
        }
        if (!description) {
            incomplete += "Descripción, ";
        }
        if (!code) {
            incomplete += "Code, ";
        }
        if (!price) {
            incomplete += "Precio, ";
        }
        if (!stock) {
            incomplete += "Stock, ";
        }
        if (!category) {
            incomplete += "Categoría, ";
        }
        if (!img1File) {
            incomplete += "Img 1, ";
        }
        if (!img2File) {
            incomplete += "Img 2, ";
        }
            incomplete = incomplete.slice(0, -2);
        Swal.fire({
            icon: 'warning',
            title: 'Error al intentar crear producto',
            text: `La información requerida para el producto está incompleta, los campos a completar son: ${incomplete}.`
        });
    }
    if (category !== "Motor" && category !== "Electricidad" && category !== "Limpieza") {
        Swal.fire({
            icon: 'warning',
            title: 'Error al intentar crear producto',
            text: `Las únicas categorías de productos que pueden publicarse son "Motor", "Electricidad" o "Limpieza". Por favor, indica a cuál de estas categorías pertenece tu producto.`
        });
    } else {
        const createResponse = await fetch(`/api/products/`, {
            method: 'POST',
            body: formData
        });
        if (createResponse.redirected) {
            let invalidTokenURL = createResponse.url;
            window.location.replace(invalidTokenURL);
        };
        const createRes = await createResponse.json();
        if (createRes.statusCode === 401) {
            Swal.fire({
                title: createRes.h1,
                text: createRes.message,
                imageUrl: createRes.img,
                imageWidth: 70,
                imageHeight: 70,
                imageAlt: createRes.h1,
            });
        } else {
            const statusCode = createRes.statusCode;
            const message = createRes.message;
            const customError = createRes.cause;
            if (statusCode === 200) {
                Swal.fire({
                icon: 'success',
                title: 'Crear producto',
                text: message
                });
            } else if (customError) {
                Swal.fire({
                icon: 'warning',
                title: 'Error al intentar crear producto',
                text: customError
                });
            } else if (statusCode === 500) {
                Swal.fire({
                icon: 'error',
                title: 'Error en el carrito',
                text: message
                });
            }
        }
    };
};
publicarBtn.addEventListener('click', function (e) {
    e.preventDefault();
    publicar();
    setTimeout(() => {
        ownerProduct();
    }, 1000);
})
const vaciarCamposBtn = document.getElementById('vaciarCamposBtn');
vaciarCamposBtn.addEventListener('click', function (e) {
    e.preventDefault();
    ownerProduct();
    const modelInput = document.querySelector('input[name="model"]');
    const descriptionInput = document.querySelector('input[name="description"]');
    const codeInput = document.querySelector('input[name="code"]');
    const priceInput = document.querySelector('input[name="price"]');
    const stockInput = document.querySelector('input[name="stock"]');
    const categoryInput = document.querySelector('input[name="category"]');
    const img1Input = document.querySelector('input[name="img1"]');
    const img2Input = document.querySelector('input[name="img2"]');
    modelInput.value = '';
    descriptionInput.value = '';
    codeInput.value = '';
    priceInput.value = '';
    stockInput.value = '';
    categoryInput.value = '';
    img1Input.value = '';
    img2Input.value = '';
    const spanImg1 = document.getElementById('nombreArchivo1');
    const spanImg2 = document.getElementById('nombreArchivo2');
    spanImg1.textContent = "Imagen 1";
    spanImg2.textContent = "Imagen 2";
    Swal.fire({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 5000,
        title: `Formulario vaciado exitosamente.`,
        icon: 'success'
    });
})

let page = 1;
let owner;

async function ownerProduct() {
    const sessionResponse = await fetch('/api/sessions/current', {
        method: 'GET',
    });
    if (sessionResponse.redirected) {
        const invalidTokenURL = sessionResponse.url;
        window.location.replace(invalidTokenURL);
    }
    const sessionRes = await sessionResponse.json();
    if (sessionRes.statusCode === 401) {
        Swal.fire({
            title: sessionRes.h1,
            text: sessionRes.message,
            imageUrl: sessionRes.img,
            imageWidth: 70,
            imageHeight: 70,
            imageAlt: sessionRes.h1,
        })
    } else {
        const statusCodeRes = sessionRes.statusCode;
        const messageRes = sessionRes.message;
        const customError = sessionRes.cause;
        if (sessionRes) {
            if (sessionRes.role === "admin") {
                owner = "admin";
            } else if (sessionRes.role === "premium") {
                owner = sessionRes.userId;
            }
            const ownerProductResponse = await fetch(`/api/products?limit=10&page=${page}&sort=1&filtro=owner&filtroVal=${owner}`, {
                method: 'GET',
            });
            if (ownerProductResponse.redirected) {
                let invalidTokenURL = ownerProductResponse.url;
                window.location.replace(invalidTokenURL);
            };
            const ownerProductRes = await ownerProductResponse.json();
            if (ownerProductRes.statusCode === 401) {
                Swal.fire({
                    title: ownerProductRes.h1,
                    text: ownerProductRes.message,
                    imageUrl: ownerProductRes.img,
                    imageWidth: 70,
                    imageHeight: 70,
                    imageAlt: ownerProductRes.h1,
                });
            } else {
                const statusCodeRes = ownerProductRes.statusCode;
                const messageRes = ownerProductRes.message;
                const result = ownerProductRes.result;
                if (statusCodeRes === 200) {
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
                                <th>Editar</th>
                                <th>Eliminar</th>
                            </tr>
                        </thead>`;
                    result.docs.forEach((product) => {
                        htmlProductos += `
                        <tr>
                            <td id="${product.title}">${product.title}</td>
                            <td class="description">${product.description}</td>
                            <td><img src="${product.img1.reference}" alt="${product.title}" class="Imgs"></td>
                            <td><img src="${product.img2.reference}" alt="${product.title}" class="Imgs"></td>
                            <td>${product.stock} Und.</td>
                            <td>$${product.price}</td>
                            <td>
                            <img style="width: 3em;" class="botonD papelera-icon " id="edit-id${product._id}" src="https://i.ibb.co/q9hxvQL/edit-removebg-preview-1.png" alt="edit">
                            </td>
                            <td>
                            <img style="width: 3em;" class="botonD papelera-icon" id="delete-id${product._id}" src="https://i.ibb.co/9rmL91b/papelera.png" alt="papelera">
                            </td>
                        </tr>`;
                    });
                    const tableProds = document.getElementById('yourProductsTable')
                    tableProds.innerHTML = htmlProductos;
                    result.docs.forEach((product) => {
                        const editBtn = document.getElementById(`edit-id${product._id}`);
                        const deleteBtn = document.getElementById(`delete-id${product._id}`);
                        const titleElement = document.getElementById(`${product.title}`);
                        const title = titleElement.textContent;
                        editBtn.addEventListener("click", () => {
                            editProd(product._id, title);
                        });
                        deleteBtn.addEventListener("click", () => {
                            deleteProd(product._id, title);
                        });
                        const hasPrevPage = result.hasPrevPage;
                        const currentPage = result.page;
                        const hasNextPage = result.hasNextPage;
                        const Pags = document.getElementById('Pags');
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
                    });
                } else if (statusCodeRes === 404) {
                    const tableProds = document.getElementById('yourProductsTable');
                    let noProducts = "";
                    noProducts += `
                    <h2 style="margin-top: 0em !important;">Aún no has publicado productos...</h2>`
                    tableProds.innerHTML = noProducts;
                    Pags.innerHTML = "";
                } else if (statusCodeRes === 500) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Error al intentar obtener los productos',
                        text: messageRes
                    });
                };
            }
        } else if (customError || statusCodeRes === 404) {
            Swal.fire({
                icon: 'warning',
                title: 'Error al obtener información del usuario',
                text: customError || messageRes
            });
        } else if (statusCodeRes === 500) {
            Swal.fire({
                icon: 'warning',
                title: 'Error al obtener información del usuario',
                text: messageRes
            });
        };
    }
}

ownerProduct();

function cambiarPagina(currentPage, newPage) {
    if (newPage === "prev") {
        page = currentPage - 1;
    }
    if (newPage === "next") {
        page = currentPage + 1;
    }
    ownerProduct();
    };
    async function deleteProd(pid, title) {
    const deleteResponse = await fetch(`/api/products/${pid}`, {
        method: 'DELETE',
    });
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
        console.log(deleteRes)
        if (statusCodeRes === 200) {
            Swal.fire({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 5000,
                title: `${title} - ` + messageRes,
                icon: 'success'
            });
        } else if (customError || statusCodeRes === 404 || statusCodeRes === 403) {
            Swal.fire({
                icon: 'warning',
                title: 'Error al intentar eliminar producto',
                text: customError || messageRes
            });
        } else if (statusCodeRes === 500) {
            Swal.fire({
                icon: 'error',
                title: 'Error al intentar eliminar producto',
                text: messageRes
            });
        };
        ownerProduct();
    }
};

async function editProd(pid, title) {
    let responseProd = await fetch(`/api/products/${pid}`, {
        method: 'GET',
    })
    if (responseProd.redirected) {
        let invalidTokenURL = responseProd.url;
        window.location.replace(invalidTokenURL);
    };
    let resProd = await responseProd.json();
    if (resProd.statusCode === 401) {
        Swal.fire({
        title: resProd.h1,
        text: resProd.message,
        imageUrl: resProd.img,
        imageWidth: 70,
        imageHeight: 70,
        imageAlt: resProd.h1,
        });
    } else {
        let statusCodeRes = resProd.statusCode;
        let messageRes = resProd.message;
        let customError = resProd.cause;
        let resultProd = resProd.result;
        if (statusCodeRes === 200) {
            function extractFileNameWithUID(url) {
                const match = url.match(/[-\w]+\s*-\s*(.+)/);
                if (match) {
                    const nombreArchivo = match[1];
                    return nombreArchivo;
                };
                return url;
            };
            let nombreArchivo3 = extractFileNameWithUID(resultProd.img1.reference);
            let nombreArchivo4 = extractFileNameWithUID(resultProd.imgBack.reference);
            Swal.fire({
                title: `<h1 style="margin-top: 0.7em;">Editar - ${title}</h1>`,
                html: `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
                    <div
                        style="display:flex; flex-direction: row; gap: 0.5em; margin: 0em; margin-bottom: 0.5em; align-items: center; justify-content: center;">
                        <input id="modelo" class="swal2-input" placeholder="Modelo"
                            style="margin: 0em !important; height: 2.7em !important; margin-top: 0.5em !important" value="${resultProd.title}">
                        <input id="code" class="swal2-input" placeholder="Code"
                            style="margin: 0em !important; height: 2.7em !important; margin-top: 0.5em !important" value="${resultProd.code}">
                        <input id="category" class="swal2-input" placeholder="Categoría"
                            style="margin: 0em !important; height: 2.7em !important; margin-top: 0.5em !important" value="${resultProd.category}">
                    </div>
                    <div style="display: flex; align-items: center; justify-content: center; width: 100%;">
                        <input id="description" class="swal2-input" placeholder="Descripción"
                            style="width: 95%; margin: 0em; margin-bottom: 0.5em; height: 3em !important; margin-top: 0.5em !important" value="${resultProd.description}">
                    </div>
                    <div
                        style="display:flex; flex-direction: row; gap: 0.5em; margin: 0em; margin-bottom: 0.5em; align-items: center; justify-content: center;">
                        <input id="price" class="swal2-input" placeholder="Precio"
                            style="margin: 0em !important; height: 2.7em !important; margin-top: 0.5em !important" value="${resultProd.price}">

                        <input id="stock" class="swal2-input" placeholder="Stock"
                            style="margin: 0em !important; height: 2.7em !important; margin-top: 0.5em !important" value="${resultProd.stock}">
                    </div>
                    <div
                    style="display:flex; flex-direction: row; gap: 0.5em; margin: 0em; margin-top: 0.9em !important; align-items: center; justify-content: center;">
                    <div style="display: flex; justify-content: center; flex-direction: column; align-items: center;">
                        <input type="file" id="editImg1" name="editImg1" style="display: none;">
                        <label for="editImg1"
                            style="padding: 10px; width: %100; font-family: 'Montserrat'; background-color: #bfe4fd; color: #002877; cursor: pointer; border-radius: 1em; border: none;">
                            <span id="nombreArchivo3">${nombreArchivo3}</span>
                        </label>
                    </div>
                    <div style="display: flex; justify-content: center; flex-direction: column; align-items: center;">
                        <input type="file" id="editImg2" name="editImg2" style="display: none;">
                        <label for="editImg2"
                            style="padding: 10px; width: %100; font-family: 'Montserrat'; background-color: #bfe4fd; color: #002877; cursor: pointer; border-radius: 1em; border: none;">
                            <span id="nombreArchivo4">${nombreArchivo4}</span>
                        </label>
                    </div>
                </div>
                    </div>
                `,
                showCancelButton: true,
                showLoaderOnConfirm: true,
                confirmButtonText: 'Confirmar cambios',
                preConfirm: () => {
                    const modelo = document.getElementById("modelo").value;
                    const description = document.getElementById("description").value;
                    const code = document.getElementById("code").value;
                    const price = document.getElementById("price").value;
                    const stock = document.getElementById("stock").value;
                    const category = document.getElementById("category").value;
                    const img1File = document.querySelector('input[name="editImg1"]').files[0];
                    const img2File = document.querySelector('input[name="editImg2"]').files[0];
                    let formData = new FormData();
                    formData.append('title', modelo);
                    formData.append('description', description);
                    formData.append('code', code);
                    formData.append('price', price);
                    formData.append('stock', stock);
                    formData.append('category', category);
                    if (img1File) {
                        formData.append('Img1', img1File);
                    } else {
                        formData.append('Img1', `${resultProd.img1.reference}`);
                    }
                    if (img2File) {
                        formData.append('Img2', img2File);
                    } else {
                        formData.append('Img2', `${resultProd.imgBack.reference}`);
                    }
                    actualizar(pid, resultProd.title, formData)
                },
            });
            changeSpanEdit()
        } else if (customError || statusCodeRes === 404) {
            Swal.fire({
                icon: 'warning',
                title: 'Error en al obtener el producto a editar',
                text: customError || messageRes
            });
        } else if (statusCodeRes === 500) {
            Swal.fire({
                icon: 'error',
                title: 'Error en al obtener el producto a editar',
                text: messageRes
            });
        };
    }
};

async function actualizar(pid, title, formData) {
    const responsePut = await fetch(`/api/products/${pid}`, {
    method: 'PUT',
    body: formData
    })
    if (responsePut.redirected) {
    let invalidTokenURL = responsePut.url;
    window.location.replace(invalidTokenURL);
    };
    const resPut = await responsePut.json();
    if (resPut.statusCode === 401) {
        Swal.fire({
            title: resPut.h1,
            text: resPut.message,
            imageUrl: resPut.img,
            imageWidth: 70,
            imageHeight: 70,
            imageAlt: resPut.h1,
        });
    } else {
        const statusCodeRes = resPut.statusCode;
        const messageRes = resPut.message;
        const customError = resPut.cause;
        if (statusCodeRes === 200) {
            Swal.fire({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 5000,
                title: `Has actualizado ${title} exitosamente.`,
                icon: 'success'
            });
            ownerProduct();
        } else if (statusCodeRes === 409) {
            Swal.fire({
                icon: 'info',
                title: 'Los datos enviados coincidieron con los datos actuales del producto',
                text: messageRes + " No se realizaron cambios."
            });
        } else if (customError || statusCodeRes === 404 || statusCodeRes === 403) {
            Swal.fire({
                icon: 'warning',
                title: 'Error al intentar actualizar el producto',
                text: customError || messageRes
            });
        } else if (statusCodeRes === 500) {
            Swal.fire({
                icon: 'error',
                title: 'Error al intentar actualizar el producto',
                text: messageRes
            });
        }
    };
}
