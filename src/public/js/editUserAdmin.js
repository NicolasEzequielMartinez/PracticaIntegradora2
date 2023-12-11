async function loadUsers() {
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
        const usersResponse = await fetch(`/api/users/getAllUsers`, {
            method: 'GET',
        });
        if (usersResponse.redirected) {
            const invalidTokenURL = usersResponse.url;
            window.location.replace(invalidTokenURL);
        };
        const usersRes = await usersResponse.json();
        if (usersRes.statusCode === 401) {
            Swal.fire({
                title: usersRes.h1,
                text: usersRes.message,
                imageUrl: usersRes.img,
                imageWidth: 70,
                imageHeight: 70,
                imageAlt: usersRes.h1,
            });
        } else {
            const statusCodeRes = usersRes.statusCode;
            const messageRes = usersRes.message;
            const customError = usersRes.cause;
            const resultUsers = usersRes.result;
            if (statusCodeRes === 200) {
                tableUsers(resultUsers);
            } else if (customError) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Error al obtener los usuarios',
                    text: customError
                });
            } else if (statusCodeRes === 404) {
                tableUsers("no users");
            } else if (statusCodeRes === 500) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al obtener los usuarios',
                    text: messageRes
                });
            }
        };
    };
};
loadUsers();

async function tableUsers(resultUsers) {
    if (resultUsers !== "no users") {
        const headTable = document.getElementById("headTable")
        headTable.innerHTML = ""
        headTable.innerHTML += `
        <tr>
        <th style="background: white; border: none"></th>
        <th style="background: white; border: none"></th>
        <th style="background: white; border: none"></th>
        <th style="background: white; border: none"></th>
        <th style="background: white; border: none"></th>
        <th style="background: white; border: none"></th>
        <th style="padding: 0.5em"><button id="deleteInactivityUsers" class="botonB" style="height: 4em; font-size: 0.9em; width: 100%; padding: 0.5em 0em;">
                <h2>Eliminar inactivos</h2>
            </button>
        </th>
        </tr>
        <tr>
            <th>Nombre</th>
            <th>Correo</th>
            <th>ID</th>
            <th>Role</th>
            <th>Last Connection</th>
            <th>Cambiar role</th>
            <th>Eliminar usuario</th>
        </tr>
            `
    const yoursUsersTable = document.getElementById("tableUsers")
    yoursUsersTable.innerHTML = ""
    resultUsers.forEach((user) => {
        const usersRow = `
            <tr>
                <td>${user.first_name}</td>
                <td>${user.email}</td>
                <td>${user._id}</td>
                <td>${user.role}</td>
                <td>${user.last_connection}</td>
                <td>
                    <img style="width: 3em;" class="botonD papelera-icon" id="edit-${user._id}" 
                    src="https://i.ibb.co/VVTLhfG/user-role-removebg-preview.png" alt="user-role-removebg-preview" border="0">
                </td>
                <td>
                    <img style="width: 3em;" class="botonD papelera-icon" id="delete-${user._id}"
                    <img src="https://i.ibb.co/tDDS3mQ/2885560-200-removebg-preview.png" alt="deleteUser" border="0">
                </td>
            </tr>`;
        yoursUsersTable.insertAdjacentHTML('beforeend', usersRow);
    });
    resultUsers.forEach((user) => {
        const editBtn = document.getElementById(`edit-${user._id}`);
        const deleteBtn = document.getElementById(`delete-${user._id}`);
        editBtn.addEventListener("click", () => {
            editUser(user._id);
        });
        deleteBtn.addEventListener("click", () => {
            deleteUser(user._id);
        });
    })
    let deleteInactivityUsers = document.getElementById("deleteInactivityUsers")
        deleteInactivityUsers.addEventListener("click", () => {
            deleteAccounts()
        });
    } else {
        let divTable = document.getElementById("yoursUsersTable")
        let noUsers = "";
        noUsers += `
        <div style="display: flex; align-items: center; justify-content: center; margin-top: 0em; flex-direction: column;">
            <img style="width: 15vw; margin-top: 4em; margin-bottom: 3em;" src="https://i.ibb.co/KGgRF5M/4570095.png" alt="4570095" border="0">
                <h2 style="margin-top: -1em;">No se han encontrado usuarios. </h2>
        </div>
        `;
        divTable.innerHTML = noUsers;
    }
};

async function editUser(uid) {
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
        const changeRoleResponse = await fetch(`/api/users/premium/${uid}`, {
            method: 'POST',
        });
        if (changeRoleResponse.redirected) {
            const invalidTokenURL = changeRoleResponse.url;
            window.location.replace(invalidTokenURL);
        };
        const changeRoleRes = await changeRoleResponse.json();
        if (changeRoleRes.statusCode === 401) {
            Swal.fire({
                title: changeRoleRes.h1,
                text: changeRoleRes.message,
                imageUrl: changeRoleRes.img,
                imageWidth: 70,
                imageHeight: 70,
                imageAlt: changeRoleRes.h1,
            });
        } else {
            const statusCodeRes = changeRoleRes.statusCode;
            const messageRes = changeRoleRes.message;
            const customError = changeRoleRes.cause;
            if (statusCodeRes === 200) {
                Swal.fire({
                    icon: 'success',
                    title: 'Actualizar role',
                    text: messageRes || 'Role actualizado exitosamente.',
                });
                loadUsers();
            } else if (customError || statusCodeRes === 404) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Error al intentar actualizar role del usuario',
                    text: customError || messageRes
                });
            } else if (statusCodeRes === 500) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al intentar actualizar role del usuario',
                    text: messageRes
                });
            }
        };
    };
}

async function deleteUser(uid) {
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
        const deleteUserResponse = await fetch(`/api/sessions/deleteAccount/${uid}`, {
            method: 'DELETE',
        });
        if (deleteUserResponse.redirected) {
            const invalidTokenURL = deleteUserResponse.url;
            window.location.replace(invalidTokenURL);
        };
        const deleteUserRes = await deleteUserResponse.json();
        if (deleteUserRes.statusCode === 401) {
            Swal.fire({
                title: deleteUserRes.h1,
                text: deleteUserRes.message,
                imageUrl: deleteUserRes.img,
                imageWidth: 70,
                imageHeight: 70,
                imageAlt: deleteUserRes.h1,
            });
        } else {
            const statusCodeRes = deleteUserRes.statusCode;
            const messageRes = deleteUserRes.message;
            const customError = deleteUserRes.cause;
            if (statusCodeRes === 200) {
                Swal.fire({
                    icon: 'success',
                    title: 'Eliminar usuario',
                    text: messageRes || 'Usuario eliminado exitosamente.',
                });
                loadUsers();
            } else if (customError || statusCodeRes === 404) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Error al intentar eliminar usuario',
                    text: customError || messageRes
                });
            } else if (statusCodeRes === 500) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al intentar eliminar usuario',
                    text: messageRes
                });
            }
        };
    };
};

async function deleteAccounts() {
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
        const deleteInactivityUsers = await fetch(`/api/users/deleteInactivityUsers`, {
            method: 'DELETE',
        });
        if (deleteInactivityUsers.redirected) {
            const invalidTokenURL = deleteInactivityUsers.url;
            window.location.replace(invalidTokenURL);
        };
        const deleteInacUserRes = await deleteInactivityUsers.json();
        if (deleteInacUserRes.statusCode === 401) {
            Swal.fire({
                title: deleteInacUserRes.h1,
                text: deleteInacUserRes.message,
                imageUrl: deleteInacUserRes.img,
                imageWidth: 70,
                imageHeight: 70,
                imageAlt: deleteInacUserRes.h1,
            });
        } else {
            const statusCodeRes = deleteInacUserRes.statusCode;
            const messageRes = deleteInacUserRes.message;
            const customError = deleteInacUserRes.cause;
            if (statusCodeRes === 200) {
                Swal.fire({
                    icon: 'success',
                    title: 'Eliminar usuarios inactivos',
                    text: messageRes
                });
                loadUsers();
            } else if (customError || statusCodeRes === 404) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Error al intentar eliminar usuarios inactivos',
                    text: customError || messageRes
                });
            } else if (statusCodeRes === 500) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al intentar eliminar usuarios inactivos',
                    text: messageRes
                });
            }
        };
    };
}
