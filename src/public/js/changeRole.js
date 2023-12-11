const form = document.getElementById('uploadDocuments');

async function cargaChageRole() {
    try {
        const response = await fetch('/api/sessions/getDocsUser', {
            method: 'GET',
        })
        if (response.redirected) {
            const invalidTokenURL = response.url;
            window.location.replace(invalidTokenURL);
        }
        const res = await response.json();
        if (res.statusCode === 401) {
            Swal.fire({
                title: res.h1,
                text: res.message,
                imageUrl: res.img,
                imageWidth: 70,
                imageHeight: 70,
                imageAlt: res.h1,
            })
        } else {
            const statusCodeRes = res.statusCode;
            const messageRes = res.message;
            const docs = res.result.docs;
            if (statusCodeRes === 200) {
                if (docs.length > 0) {
                    for (let i = 0; i < docs.length; i++) {
                        const documento = docs[i];
                        const nombreArchivo = extractFileNameWithUID(documento.reference);
                        if (documento.name === "Identificación") {
                            let spanArchivo = document.getElementById('nombreArchivo1');
                            spanArchivo.textContent = nombreArchivo;
                        } else if (documento.name === "Comprobante de domicilio") {
                            let spanArchivo = document.getElementById('nombreArchivo2');
                            spanArchivo.textContent = nombreArchivo;
                        } else if (documento.name === "Comprobante de estado de cuenta") {
                            let spanArchivo = document.getElementById('nombreArchivo3');
                            spanArchivo.textContent = nombreArchivo;
                        };
                    };
                };
            } else if (statusCodeRes === 404) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Error al obtener documentación del usuario',
                    text: messageRes
                });
            } else if (statusCodeRes === 500) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al obtener documentación del usuario',
                    text: messageRes
                });
            };
        };
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error en la solicitud obtener documentación del usuario.',
            text: 'Error: ' + error.message
        });
    };
};
cargaChageRole();
function extractFileNameWithUID(url) {
    const match = url.match(/[-\w]+\s*-\s*(.+)/);
    if (match) {
        const nombreArchivo = match[1];
        return nombreArchivo;
    };
    return url;
};
const cargarDocs = document.getElementById('cargarDocs');
cargarDocs.addEventListener("click", (event) => {
    event.preventDefault();
    cargarDocuments();
});
async function cargarDocuments() {
    try {
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
            try {
                let uid = sessionRes.userId;
                const formDocs = new FormData(form);
                const uploadDocsRes = await fetch(`/api/users/${uid}/documents`, {
                    method: 'POST',
                    body: formDocs
                });
                if (uploadDocsRes.redirected) {
                    const invalidTokenURL = uploadDocsRes.url;
                    window.location.replace(invalidTokenURL);
                };
                const docsRes = await uploadDocsRes.json();
                if (docsRes.statusCode === 401) {
                    Swal.fire({
                        title: docsRes.h1,
                        text: docsRes.message,
                        imageUrl: docsRes.img,
                        imageWidth: 70,
                        imageHeight: 70,
                        imageAlt: docsRes.h1,
                    });
                } else {
                    const statusCodeDocsRes = docsRes.statusCode;
                    const messageRes = docsRes.message;
                    const customError = docsRes.message;
                    if (statusCodeDocsRes === 200) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Cargar documentación',
                            text: messageRes || 'Documentación actualizada exitosamente.',
                        });
                        setTimeout(() => {
                            cargaChageRole();
                        }, 2000);
                    } else if (statusCodeDocsRes === 206) {
                        Swal.fire({
                            icon: 'info',
                            title: 'Cargar documentación',
                            text: messageRes || 'Documentación actualizada exitosamente.',
                        });
                        setTimeout(() => {
                            cargaChageRole();
                        }, 2000);
                    } else if (customError || statusCodeDocsRes === 404) {
                        Swal.fire({
                            icon: 'warning',
                            title: 'Error al intentar cargar documentación',
                            text: customError || messageRes || 'Hubo un problema al intentar cargar la documentación.',
                        });
                    } else if (statusCodeDocsRes === 500) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error al intentar cargar documentación',
                            text: messageRes || 'Hubo un problema al intentar cargar la documentación.',
                        });
                    }
                };
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: "Error en la solicitud de cargar documentos",
                    text: 'Error: ' + error.message
                });
            };
        };
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: "Error en la solicitud de obtener credenciales del usuario",
            text: 'Error: ' + error.message
        });
    };
};

const ChangeROLE = document.getElementById('ChangeROLE');
ChangeROLE.addEventListener("click", async (event) => {
    event.preventDefault();
    try {
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
            let uid = sessionRes.userId;
            let role = sessionRes.role;
            if (role === "user") {
                const confirmationResult = await Swal.fire({
                    title: 'Confirmar cambio de role',
                    text: '¿Deseas actualizar a "Premium"? Los usuarios premium pueden publicar, editar y eliminar productos, aunque el administrador puede eliminar contenido que incumpla nuestras políticas. ¿Confirmas el cambio?',
                    icon: 'info',
                    showCancelButton: true,
                    confirmButtonText: 'Sí, confirmar',
                    cancelButtonText: 'Cancelar',
                });
                if (confirmationResult.isConfirmed) {
                    cambiarRole(uid);
                }
            } else if (role === "premium") {
                const confirmationResult = await Swal.fire({
                    title: 'Confirmar cambio de role',
                    text: '¿Estás seguro de que deseas cambiar a role "User"? Ten en cuenta que si realizas este cambio, todos los productos que hayas publicado como usuario premium serán eliminados automáticamente de la plataforma. ¿Confirmas esta modificación?',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Sí, confirmar',
                    cancelButtonText: 'Cancelar',
                });
                if (confirmationResult.isConfirmed) {
                    cambiarRole(uid);
                }
            }
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: "Error en la solicitud de obtener credenciales del usuario",
            text: 'Error: ' + error.message
        });
    };
});

async function cambiarRole(uid) {
    try {
        const response = await fetch(`/api/users/premium/${uid}`, {
            method: 'POST',
        });
        if (response.redirected) {
            const invalidTokenURL = response.url;
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
            const customError = res.cause;
            if (statusCode === 200) {
                Swal.fire({
                    icon: 'success',
                    title: 'Actualizar role',
                    text: message || 'Role actualizado exitosamente.',
                });
            } else if (customError || statusCode === 404 || statusCode === 422) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Error al intentar actualizar role',
                    text: customError || message || 'Hubo un problema al intentar actualizar role del user.',
                });
            } else if (statusCode === 500) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al intentar actualizar role',
                    text: message || 'Hubo un problema al intentar actualizar role del user.',
                });
            }
        };
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error en la solicitud de actualizar role',
            text: 'Error: ' + error.message
        });
    };
};