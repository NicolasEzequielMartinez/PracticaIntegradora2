const sectionPerfil = document.getElementById('sectionPerfil');
const btnsEditarPerfil = document.getElementById('btnsEditarPerfil');

async function verPerfil() {
    const response = await fetch('/api/sessions/profile', {
        method: 'GET',
    })
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
        const statusCodeRes = res.statusCode;
        const messageRes = res.message;
        const user = res.result;
        if (statusCodeRes === 200) {
            let h1 = document.getElementById('h1');
            h1.style = style = "display: block";
            let htmlPerfil = "";
            htmlPerfil += `
            <div style="width: 92%; margin-left: 1.7em; border: 0.1em solid rgb(188 188 188 / 78%); padding: 1em; border-radius: 1em; margin-bottom: 1em !important;">
                <div style="display: flex; justify-content: center; gap: 2em; flex-direction: row; align-items: center; margin: 0em 2em; ">
                    <div style="display: flex; justify-content: center; gap: 0em; flex-direction: column; align-items: center; width: 80%; border-right: 0.1em solid #95d0f7; padding-right: 1.5em">
                    <img src=${user.photo} alt="ADD-PHOTO" border="0" style="height: 25vh; width: 25vh; object-fit: cover; object-position: center; border-radius: 1em; margin-bottom: 0em;" />
                    </div>
                    <div style="display: flex; justify-content: center; gap: 2em; flex-direction: column; align-items: center; flex-grow: 1;">
                        <div style="display: flex; gap: 6em;">
                            <div style="display: flex; flex-direction: row ; align-items: center; gap: 1.33em">
                                <h2 style="margin-top: 0em">Nombre </h2>
                                <p style="margin-top: 0em">${user.name}</p>
                            </div>
                            <div style="display: flex; flex-direction: row ; align-items: center; gap: 1.33em">
                                <h2 style="margin-top: 0em">Rol</h2>
                                <p style="margin-top: 0em"> ${user.role}</p>
                            </div>
                        </div>
                        <div style="display: flex; flex-direction: column ; align-items: center; gap: 0.5em">
                            <h2 style="margin-top: 0em">Correo </h2>
                            <p style="margin-top: 0em"> ${user.email}</p>
                        </div>
                    </div>
                </div>
            </div>`
            sectionPerfil.innerHTML = htmlPerfil;
            let htmlEditarP = "";
            htmlEditarP += `<button class="boton" id="btnEditarPerfil">Editar perfil</button>`
            btnsEditarPerfil.innerHTML = htmlEditarP;
            const btnEditarPerfil = document.getElementById('btnEditarPerfil');
            btnEditarPerfil.addEventListener("click", () => {
                editarPerfil();
            });
        } else if (statusCodeRes === 404) {
            Swal.fire({
                icon: 'warning',
                title: 'Error al obtener perfil del usuario',
                text: messageRes
            });
        } else if (statusCodeRes === 500) {
            Swal.fire({
                icon: 'error',
                title: 'Error al obtener perfil del usuario',
                text: messageRes
            });
        };
    };
};

verPerfil();

const inputFileCustom = document.getElementById('inputFileCustom');
async function editarPerfil() {
    const response = await fetch('/api/sessions/profile', {
        method: 'GET',
    })
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
        const statusCodeRes = res.statusCode;
        const messageRes = res.message;
        const user = res.result;
        if (statusCodeRes === 200) {
            let h1 = document.getElementById('h1');
            h1.style = style = "display: none";
            let htmlPerfil = ""
            htmlPerfil += `
            <div    style="width: 190%; margin-left: -8.3em; border: 0.1em solid rgb(188 188 188 / 78%); padding: 1em; border-radius: 1em; margin-bottom: 1em !important;">
                <form id="editProfileForm" style="display: flex; justify-content: center; gap: 2em; flex-direction: row; align-items: center; width: 100%;">
                    <div style="display: flex; justify-content: center; gap: 0em; flex-direction: column; align-items: center; width: 80%; border-right: 0.1em solid #95d0f7; padding-right: 1.5em">
                    <img src=${user.photo} alt="ADD-PHOTO" border="0" style="height: 25vh; width: 25vh; object-fit: cover; object-position: center; border-radius: 1em; margin-bottom: 1em;" />
                        <div>
                            <div style="display: flex; justify-content: center; gap: 1em; flex-direction: column; align-items: center;">
                                <input type="file" id="archivoInputProfile" name="profile" style="display: none;">
                                <label for="archivoInputProfile" style="text-align: center; padding: 10px; font-family: 'Montserrat'; background-color: #bfe4fd; color: #002877; cursor: pointer; border-radius: 1em; border: none; width: 70%">
                                    <span id="nombreArchivo">Agrega una foto de perfil</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    <div style="display: flex; justify-content: center; gap: 1.5em; flex-direction: column; align-items: center; flex-grow: 1; width: 120% !important">
                        <div style="width: 100% !important">
                            <h2 style="margin-top: 0em; margin-bottom: 0.5em;">Nombre</h2>
                            <div style="display: flex; flex-direction: row; gap: 0.5em; width: 100%; align-items: center; justify-content: center;">
                                <span class="material-symbols-outlined" style="position: absolute; margin-top: 0.3em ; margin-left: -26%;">badge</span>
                                <input style="margin-top: 0.5em; width: 100% !important" type="text" id="nombreInput" name="name" placeholder="${user.name}" required>
                            </div>
                        </div>
                        <div style="width: 100% !important">
                            <h2 style="margin-top: 0em; margin-bottom: 0.5em;">Correo</h2>
                            <div style="display: flex; flex-direction: row; gap: 0.5em; width: 100%; align-items: center; justify-content: center;">
                                <span class="material-symbols-outlined" style="position: absolute; margin-top: 0.3em ; margin-left: -26%;">alternate_email</span>
                                <input style="margin-top: 0.5em; width: 100% !important; font-size: 0.90em; " type="text" id="correoInput" name="email" placeholder="${user.email}" required>
                            </div>
                        </div>
                    </div>
                </form>
            </div>`
            sectionPerfil.innerHTML = htmlPerfil;
            let htmlEditarP = "";
            htmlEditarP += `<button class="boton" id="btnConfirmarCambios">Confirmar cambios</button>`
            btnsEditarPerfil.innerHTML = htmlEditarP;
            const archivoInputProfile = document.getElementById('archivoInputProfile');
            const nombreArchivo = document.getElementById('nombreArchivo');
            archivoInputProfile.addEventListener('change', () => {
                const archivos = archivoInputProfile.files;
                nombreArchivo.textContent = archivos[0].name;
            })
            const formEditProfile = document.getElementById('editProfileForm');
            const btnConfirmarCambios = document.getElementById('btnConfirmarCambios');
            btnConfirmarCambios.addEventListener("click", () => {
                confirmarCambios(formEditProfile);
            });
        } else if (statusCodeRes === 404) {
            Swal.fire({
                icon: 'warning',
                title: 'Error al obtener perfil del usuario',
                text: messageRes
            });
        } else if (statusCodeRes === 500) {
            Swal.fire({
                icon: 'error',
                title: 'Error al obtener perfil del usuario',
                text: messageRes
            });
        };
    };
};

async function confirmarCambios(formEditProfile) {
    const data = new FormData(formEditProfile);
    try {
        const response = await fetch('/api/sessions/editProfile', {
            method: 'POST',
            body: data,
        });
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
            const statusCodeRes = res.statusCode;
            const messageRes = res.message;
            const customError = res.cause;
            if (statusCodeRes === 200) {
                Swal.fire({
                    icon: 'success',
                    title: 'Editar perfil',
                    text: messageRes || 'Perfil actualizado exitosamente.',
                });
                setTimeout(() => {
                    verPerfil();
                }, 2000);
            } else if (customError || statusCodeRes === 404) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Error al intentar actualizar perfil',
                    text: customError | messageRes || 'Hubo un problema al intentar actualizar perfil.',
                });
            } else if (statusCodeRes === 400) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Sin cambios',
                    text: messageRes || 'No se realizaron cambios en el perfil.',
                })
                setTimeout(() => {
                    verPerfil();
                }, 2000);
            } else if (statusCodeRes === 500) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al intentar actualizar perfil',
                    text: messageRes || 'Hubo un problema al intentar intentar actualizar perfil.',
                });
            };
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error en la solicitud de editar perfil',
            text: 'Error: ' + error.message
        });
    };
};

const btnCerrarSession = document.getElementById('btnCerrarSession');

btnCerrarSession.addEventListener("click", () => {
    cerrarSession();
});

async function cerrarSession() {
    try {
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
            } else if (customError) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Error al intentar cerrar session',
                    text: customError || 'Hubo un problema al intentar cerrar la session.',
                });
            } else if (statusCode === 404) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Error al intentar cerrar session',
                    text: message || 'Hubo un problema al intentar cerrar la session.',
                });
            } else if (statusCode === 500) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al intentar cerrar session',
                    text: message || 'Hubo un problema al intentar cerrar la session.',
                });
            };
        };
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error en la solicitud de cerrar session',
            text: 'Error: ' + error.message
        });
    };
};

const btnCerrarCuenta = document.getElementById('btnCerrarCuenta');

btnCerrarCuenta.addEventListener("click", async () => {
    const confirmationResult = await Swal.fire({
        title: 'Confirmar eliminación de cuenta',
        text: '¿Estás seguro de que deseas eliminar tu cuenta? Ten en cuenta que esta acción conllevará la eliminación de tu carrito actual y todos los productos que hayas publicado como usuario premium.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, confirmar',
        cancelButtonText: 'Cancelar',
    });
    if (confirmationResult.isConfirmed) {
        cerrarCuenta();
    };
});

async function cerrarCuenta() {
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
        const uid = sessionRes.userId;
        try {
            const response = await fetch(`api/sessions/deleteAccount/${uid}`, {
                method: 'DELETE',
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
                        title: 'Eliminar cuenta',
                        text: message || 'La cuenta se ha eliminado exitosamente',
                    });
                    setTimeout(() => {
                        window.location.replace('/login');
                    }, 4000);
                } else if (customError || statusCode === 404) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Error al intentar eliminar cuenta',
                        text: customError || message || 'Hubo un problema al intentar eliminar la cuenta.',
                    });
                } else if (statusCode === 500) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al intentar eliminar cuenta',
                        text: message || 'Hubo un problema al intentar eliminar la cuenta.',
                    });
                };
            };
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error en la solicitud de eliminar cuenta',
                text: 'Error: ' + error.message
            });
        };
    };
};