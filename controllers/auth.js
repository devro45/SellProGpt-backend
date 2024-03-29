const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const { expressjwt: expressJwt } = require("express-jwt");
const config = require("config");

exports.signup = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.send(422).json({
      errors: errors.array()[0].msg,
    });
  }

  User.findOne({ email: req.body.email })
    .then((existingUser) => {
      if (existingUser) {
        return res.status(422).json({
          error: "Email is already in use, please try another one.",
        });
      } else {
        const newUser = new User(req.body);
        newUser
          .save()
          .then((savedUser) => {
            const payload = { id: savedUser._id };
            jwt.sign(
              payload,
              config.get("jwtsecret"),
              { expiresIn: 3600 },
              (err, token) => {
                if (err) {
                  throw err;
                }
                res.json({
                  token,
                  user: {
                    id: savedUser._id,
                    name: savedUser.name,
                    email: savedUser.email,
                  },
                });
              }
            );
          })
          .catch((err) => {
            res.status(400).json({
              error: "Unable to save user in the database.",
            });
          });
      }
    })
    .catch((err) => {
      console.error("Error checking for existing user:", err);
      res.status(500).json({
        error: "Internal server error.",
      });
    });
};

exports.signin = (req, res) => {
  const errors = validationResult(req);
  const { email, password } = req.body;
  if (!errors.isEmpty()) {
    return res.send(422).json({
      error: errors.array()[0].msg,
    });
  }
  User.findOne({ email })
    .then((user) => {
      if (!user) {
        return res.status(400).json({
          error: "User not registered, please register and try again",
        });
      }

      if (!user.authenticate(password)) {
        return res.status(401).json({
          error: "Invalid credentials",
        });
      }

      const token = jwt.sign({ id: user._id }, config.get("jwtsecret"));
      res.cookie("token", token, { expire: new Date() + 9999 });

      const { _id, name, email, role } = user;
      res.json({ token, user: { _id, name, email, role } });
    })
    .catch((err) => {
      console.error("Error finding user:", err);
      res.status(500).json({
        error: "Internal server error",
      });
    });
};

exports.signout = (req, res) => {
  res.clearCookie("token");
  res.json({
    message: "User sign out successfully",
  });
};

exports.isSignedIn = expressJwt({
  secret: config.get("jwtsecret"),
  userProperty: "auth",
  algorithms: ["HS256"],
});

exports.isAuthenticated = (req, res, next) => {
  let checker = req.profile && req.auth && req.profile._id == req.auth.id;
  if (!checker) {
    return res.status(403).json({
      error: "Access Denied",
    });
  }
  next();
};

exports.isAdmin = (req, res, next) => {
  if (req.profile.role === 0) {
    return res.status(403).json({
      error: "You are not ADMIN, Access denied",
    });
  }
  next();
};
