const form = document.getElementById('loginForm');
const saludoYaMostrado = localStorage.getItem('saludoMostrado');

if(!saludoYaMostrado){
    localStorage.setItem('saludoMostrado', 'false'); 
} else if (saludoYaMostrado === 'true') {
    localStorage.setItem('saludoMostrado', 'false'); 
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const obj = {};
    data.forEach((value, key) => (obj[key] = value));
    try {
        const response = await fetch('/api/sessions/login', {
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
            if (res.role === "user" || res.role === "premium") {
                window.location.replace('/products');
            } else if (res.role === "admin") {
                window.location.replace('/adminPanel');
            }
        } else if (customError) {
            Swal.fire({
                icon: 'warning',
                title: 'Error de inicio de sesión',
                text: customError || 'Error en el login. Inténtalo de nuevo.',
            });
        } else if (statusCodeRes === 404 || statusCodeRes === 409) {
            Swal.fire({
                icon: 'warning',
                title: 'Error de inicio de sesión',
                text: messageRes || 'Error en el login. Inténtalo de nuevo.',
            });
        } else if (statusCodeRes === 500) {
            Swal.fire({
                icon: 'error',
                title: 'Error de inicio de sesión',
                text: messageRes || 'Error en el login. Inténtalo de nuevo.',
            });
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error en la solicitud de login',
            text: 'Error: ' + error.message
        });
    }
});