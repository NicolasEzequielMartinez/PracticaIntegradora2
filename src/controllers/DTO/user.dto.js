export class CurrentUserDTO{
    constructor(user){
        this.name = user.first_name;
        this.cart = user.cart;
        this.email = user.email;
        this.userId = user.userID;
        this.role = user.role;
    }
}
