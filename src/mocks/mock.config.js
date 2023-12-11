import { faker } from "@faker-js/faker";

export const generateProduct = () => {
    return {
        title: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        code: faker.string.uuid(),
        price: faker.number.int({ min: 300, max: 3000, dec: 0}),
        stock: faker.number.int({ min: 1, max: 30 }),
        category: faker.commerce.department(),
        img1: faker.image.url(),
        img2: faker.image.url()
    }
};

export const generateUser = () => {
    return {
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: faker.internet.email(),
        age:  faker.number.int({ min: 18, max: 99 }),
        password: faker.internet.password()
    };
};