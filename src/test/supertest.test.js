import chai from "chai";
import supertest from "supertest";
import { generateProduct, generateUser } from "../mocks/mock.config.js";
import config from "../config.js";

const expect = chai.expect;
const requester = supertest(`http://localhost:${config.PORT}`);

let userRegLog = generateUser();
let currentUser;
let CoderCookie;
let CoderCookiePremium;
let productCreate = generateProduct()
let idProductCreateSuccess;
let idProdInCart;

describe('MECATRON REPUESTOS', () => {
    describe('Test Session', () => {
        it('POST - /api/sessions/register (Debe crear al usuario en la DB, con todas sus propiedades)', async () => {
            const result = await requester.post('/api/sessions/register').send(userRegLog);
            expect(result.ok).to.be.ok;
            expect(result.statusCode).to.equal(200);
            expect(result.body.user).to.have.all.keys(
                'first_name',
                'last_name',
                'email',
                'age',
                'password',
                'role',
                'cart',
                '_id',
                '__v'
            );
        }).timeout(10000);
        it('POST - /api/sessions/login (Se debe loguear al usuario correctamente y generarse la cookie con su respectivo token)', async () => {
            const userLog = {
                email: userRegLog.email,
                password: userRegLog.password
            };
            const result = await requester.post('/api/sessions/login').send(userLog)
            expect(result.ok).to.be.ok;
            expect(result.statusCode).to.equal(200);
            const cookieResult = result.headers['set-cookie'][0];
            expect(cookieResult).to.be.ok;
            CoderCookie = {
                name: cookieResult.split('=')[0],
                value: cookieResult.split('=')[1]
            };
            expect(CoderCookie.name).to.be.ok.and.equal('CoderCookie123');
            expect(CoderCookie.value).to.be.ok;
        }).timeout(10000);
        it('GET - /api/sessions/current (Se deben obtener los datos filtrados por el CurrentUserDTO)', async () => {
            const result = await requester.get('/api/sessions/current').set('Cookie', [`${CoderCookie.name}=${CoderCookie.value}`]);
            expect(result.body).to.have.all.keys(
                'name',
                'cart',
                'email',
                'userId',
                'role'
            );
            currentUser = result.body;
        }).timeout(10000);
        it('POST - /api/sessions/premium/:uid (Se debe cambiar el rol del usuario a premium)', async () => {
            const result = await requester.post(`/api/sessions/premium/${currentUser.userId}`)
            expect(result.ok).to.be.ok;
            expect(result.body.statusCode).to.equal(200);
            expect(result.body.message).to.equal('Usuario actualizado exitosamente, su rol a sido actualizado a premium.');
            const newCookieResult = result.headers['set-cookie'][0];
            expect(newCookieResult).to.be.ok;
            CoderCookiePremium = {
                name: newCookieResult.split('=')[0],
                value: newCookieResult.split('=')[1]
            };
            expect(CoderCookiePremium.name).to.be.ok.and.equal('CoderCookie123');
            expect(CoderCookiePremium.value).to.be.ok;
        }).timeout(10000);
    })
    describe('Test Products', () => {
        it('POST - /api/products/ (Se debe crear un producto exitosamente)', async () => {
            const result = await requester.post('/api/products/').set('Cookie', [`${CoderCookiePremium.name}=${CoderCookiePremium.value}`]).send(productCreate);
            expect(result.ok).to.be.ok;
            expect(result.body.statusCode).to.equal(200);
            expect(result.body.result).to.have.all.keys(
                "_id",
                'title',
                'description',
                'code',
                'price',
                'stock',
                'category',
                'thumbnails',
                "owner",
                "__v")
            idProductCreateSuccess = result.body.result._id;
        }).timeout(10000);
        it('PUT - /api/products/:pid (Se debe actualizar el producto exitosamente)', async () => {
            const result = await requester.put(`/api/products/${idProductCreateSuccess}`).set('Cookie', [`${CoderCookiePremium.name}=${CoderCookiePremium.value}`]).send({
                price: 1234
            })
            expect(result.ok).to.be.ok;
            expect(result.body.statusCode).to.equal(200);
            expect(result.body.result.modifiedCount).to.equal(1);
        }).timeout(10000);
        it('DELETE - /api/products/:pid (Se debe eliminar el producto exitosamente)', async () => {
            const result = await requester.delete(`/api/products/${idProductCreateSuccess}`).set('Cookie', [`${CoderCookiePremium.name}=${CoderCookiePremium.value}`])
            expect(result.ok).to.be.ok;
            expect(result.body.statusCode).to.equal(200);
            expect(result.body.result.deletedCount).to.equal(1);
        }).timeout(10000);
    })
    describe('Test Carts', () => {
        it('POST - /api/carts/:cid/products/:pid/quantity/:quantity (Se debe agregar un producto al carrito del usuario)', async () => {
            const result = await requester.post(`/api/carts/${currentUser.cart}/products/6510b2a776e6b8994a246741/quantity/1`).set('Cookie', [`${CoderCookiePremium.name}=${CoderCookiePremium.value}`])
            expect(result.ok).to.be.ok;
            expect(result.body.statusCode).to.equal(200);
            expect(result.body.message).to.equal('Producto agregado al carrito exitosamente.');
            expect(result.body.result.result._id).to.equal(currentUser.cart);
            const productsArray = result.body.result.result.products
            idProdInCart = productsArray[0]._id;
        }).timeout(10000);
        it('PUT - /api/carts/:cid/products/:pid (Se debe actualizar la cantidad de un producto en carrito)', async () => {
            const result = await requester.put(`/api/carts/${currentUser.cart}/products/${idProdInCart}`).set('Cookie', [`${CoderCookiePremium.name}=${CoderCookiePremium.value}`]).send({
                quantity: 3
            })
            expect(result.ok).to.be.ok;
            expect(result.body.statusCode).to.equal(200);
            expect(result.body.result.newQuantity).to.equal(3);
        }).timeout(10000);
        it('DELETE - /api/carts/:cid (Se deben borrar todos los productos del carrito)', async () =>{
            const result = await requester.delete(`/api/carts/${currentUser.cart}`).set('Cookie', [`${CoderCookiePremium.name}=${CoderCookiePremium.value}`])
            expect(result.ok).to.be.ok;
            expect(result.body.statusCode).to.equal(200);
            expect(result.body.message).to.equal('Los productos del carrito se han eliminado exitosamente.');
        }).timeout(10000);
    });
})