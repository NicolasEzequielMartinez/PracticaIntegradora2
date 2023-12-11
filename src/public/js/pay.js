const parrafo = document.getElementById("parrafo")
async function paySuccess() {
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
        })
    } else {
        try {
            const purchaseResponse = await fetch(`/api/carts/${sessionRes.cart}/purchaseSuccess`, {
                method: 'POST',
            });
            if (purchaseResponse.redirected) {
                const invalidTokenURL = purchaseResponse.url;
                window.location.replace(invalidTokenURL);
            }
            const purchaseRes = await purchaseResponse.json();
            if (purchaseRes.statusCode === 401) {
                Swal.fire({
                    title: purchaseRes.h1,
                    text: purchaseRes.message,
                    imageUrl: purchaseRes.img,
                    imageWidth: 70,
                    imageHeight: 70,
                    imageAlt: purchaseRes.h1,
                })
            } else {
                const statusCodeRes = purchaseRes.statusCode;
                const messageRes = purchaseRes.message;
                const customError = purchaseRes.cause;
                if (statusCodeRes === 200) {
                    parrafo.innerHTML = `
                    <p style="margin: 0.7em">
                    <p style="margin: 0.7em">En breve, encontrarás el recibo de compra en la sección de tickets de tu carrito.</p>
                    <p style="margin: 0.7em">Gracias por tu compra. Atentamente, Global Technology.</p>
                    `;
                } else if (customError || statusCodeRes === 404) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'El pago ya fue realizado, pero hubo un error al procesar la compra',
                        text: customError || messageRes
                    });
                } else if (statusCodeRes === 500) {
                    Swal.fire({
                        icon: 'error',
                        title: 'El pago ya fue realizado, pero hubo un error al procesar la compra',
                        text: messageRes
                    });
                }
            };
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error en la solicitud de procesar compra',
                text: 'Error: ' + error.message
            });
        };
    };
};

paySuccess();