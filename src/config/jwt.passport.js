import passport from "passport";
import jwt from "passport-jwt";
import config from "../config.js";

const JWTStrategy = jwt.Strategy;
const ExtracJWT = jwt.ExtractJwt;

export const initializePassportJWT = () => {
    passport.use('jwt', new JWTStrategy({
        jwtFromRequest: ExtracJWT.fromExtractors([cookieExtractor]),
        secretOrKey: config.JWT_SECRET
    }, async(jwtPayload, done) => {
        try{
            return done(null, jwtPayload);
        } catch(error){
            return done (error);
        }
    }))

    passport.use('jwtResetPass', new JWTStrategy({
        jwtFromRequest: ExtracJWT.fromExtractors([queryExtractor]),
        secretOrKey: config.RESET_PASSWORD_TOKEN
    }, async (jwtPayload, done) => {
        try {
            return done(null, jwtPayload);
        } catch (error) {
            return done(error);
        }
    }))
};

const cookieExtractor = (req) => {
    let token = null;
    if (req && req.signedCookies) {
        token = req.signedCookies[config.JWT_COOKIE]
    }
    return token 
};

const queryExtractor = (req) => {
    let token = null;
    if (req.query ) {
        token = req.query.token
    }
    return token
};