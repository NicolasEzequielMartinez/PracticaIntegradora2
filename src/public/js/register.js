const form = document.getElementById('registerForm');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const obj = {};
    data.forEach((value, key) => (obj[key] = value));
    try {
        const response = await fetch('/api/sessions/register', {
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
            form.reset();
            window.location.href = '/login';
        } else if (customError) {
            Swal.fire({
                icon: 'warning',
                title: 'Error de registro',
                text: customError || 'Error en el registro. Inténtalo de nuevo.',
            });
        } else if (statusCodeRes === 409) {
            Swal.fire({
                icon: 'warning',
                title: 'Error de registro',
                text: messageRes || 'Error en el registro. Inténtalo de nuevo.',
            });
        } else if (statusCodeRes === 500) {
            Swal.fire({
                icon: 'error',
                title: 'Error de registro',
                text: messageRes || 'Error en el registro. Inténtalo de nuevo.',
            });
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error en la solicitud de registro',
            text: 'Error: ' + error.message
        });
    }
});