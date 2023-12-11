export class ProfileUserDTO{
    constructor(user){
        this.name = user.first_name;
        this.email = user.email;
        this.role = user.role;
        this.photo = user.photo;
    }
}
