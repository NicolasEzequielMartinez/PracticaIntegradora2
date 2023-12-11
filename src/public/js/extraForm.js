const extraForm = document.getElementById('extraForm');

extraForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(extraForm);
    const obj = {};
    data.forEach((value, key) => (obj[key] = value));
    try {
        const response = await fetch('/api/sessions/completeProfile', {
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
            extraForm.reset();
            window.location.replace(res.redirectTo);
        } else if (customError) {
            Swal.fire({
                icon: 'warning',
                title: 'Error al completar el perfil',
                text: customError || 'Error al completar el perfil. Inténtalo de nuevo.',
            });
        } else if (statusCodeRes === 409) {
            Swal.fire({
                icon: 'warning',
                title: 'Error al completar el perfil',
                text: messageRes || 'Error al completar el perfil. Inténtalo de nuevo.',
            });
        } else if (statusCodeRes === 500) {
            Swal.fire({
                icon: 'error',
                title: 'Error al completar el perfil',
                text: messageRes || 'Error al completar el perfil. Inténtalo de nuevo.',
            });
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error en la solicitud de register/login con GitHub',
            text: 'Error: ' + error.message
        });
    }
});