const formResetPass1 = document.getElementById('resetPassForm1');

formResetPass1.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(formResetPass1);
    const obj = {};
    data.forEach((value, key) => (obj[key] = value));
    try {
        const response = await fetch('/api/sessions/requestResetPassword', {
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
            formResetPass1.reset();
            Swal.fire({
                icon: 'success',
                title: 'Correo enviado',
                text: 'Te enviamos un correo con el enlace para que puedas reestablecer tu contraseña.',
            });
        } else if (customError) {
            Swal.fire({
                icon: 'warning',
                title: 'Error en el cambio de contraseña',
                text: customError || 'Ha ocurrido un error al enviar el correo de reestablecimiento de contraseña. Inténtelo de nuevo.',
            });
        } else if (statusCodeRes === 404) {
            Swal.fire({
                icon: 'warning',
                title: 'Error en el cambio de contraseña',
                text: messageRes || 'Ha ocurrido un error al enviar el correo de reestablecimiento de contraseña. Inténtelo de nuevo.',
            });
        } else if (statusCodeRes === 500) {
            Swal.fire({
                icon: 'error',
                title: 'Error de inicio de sesión',
                text: messageRes || 'Ha ocurrido un error al enviar el correo de reestablecimiento de contraseña. Inténtelo de nuevo.',
            });
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error en la solicitud - Reset Pass Send Mail',
            text: 'Error: ' + error.message
        });
    }
})