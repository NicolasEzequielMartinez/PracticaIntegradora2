const formResetPass2 = document.getElementById('resetPassForm2');

formResetPass2.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(formResetPass2);
    const obj = {};
    data.forEach((value, key) => (obj[key] = value));
    try {
        const response = await fetch('/api/sessions/resetPassword', {
            method: 'POST',
            body: JSON.stringify(obj),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const res = await response.json();
        const statusCodeRes = res.statusCode;
        const messageRes = res.message;
        const customError = res.cause;
        if (statusCodeRes === 200) {
            formResetPass2.reset();
            Swal.fire({
                icon: 'success',
                title: 'Contraseña actualizada.',
                text: 'Su contraseña ya ha sido actualizada. Puede hacer click en “Iniciar sesión” para loguearse con su correo y nueva contraseña.',
            });
        } else if (customError) {
            Swal.fire({
                icon: 'warning',
                title: 'Error en el cambio de contraseña',
                text: customError || 'Error en el login. Inténtalo de nuevo.',
            });
        } else if (statusCodeRes === 400 || statusCodeRes === 404) {
            Swal.fire({
                icon: 'warning',
                title: 'Error en el cambio de contraseña',
                text: messageRes || 'Error en el login. Inténtalo de nuevo.',
            });
        } else if (statusCodeRes === 500) {
            Swal.fire({
                icon: 'error',
                title: 'Error en el cambio de contraseña',
                text: messageRes || 'Error en el login. Inténtalo de nuevo.',
            });
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error en la solicitud - Reset Password',
            text: 'Error: ' + error.message
        });
    };
});