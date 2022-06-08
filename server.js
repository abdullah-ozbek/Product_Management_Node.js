"use strict";

const express = require("express");
const flash = require('express-flash');
const APP = express();
const IP = "127.0.0.1";
const PORT = 8081;
const bodyParser = require('body-parser');
const fileupload = require("express-fileupload");
const path = require("path");
const session = require("express-session");
const MySQLStore = require("connect-mysql")(session);
const methodOverride = require('method-override');

const Product = require("./models/product");
const User = require("./models/user");

const sequelize = require("./database");

APP.set("view engine", "ejs");
APP.use(express.static("public"));
// APP.use(express.urlencoded({extended: true}));
// APP.use(express.json());
APP.use(bodyParser.urlencoded({ extended: false }))
APP.use(bodyParser.json());
APP.use(fileupload());
APP.use(methodOverride('_method'));

const options = {
    config: {
        user: 'root',
        password: '',
        database: 'mydatabase'
    }
}

APP.use(session({
    secret: 'testotesto',
    resave: false,
    saveUninitialized: true,
    store: new MySQLStore(options)
}));

APP.use(flash());


APP.use((req, res, next) => {
    const userId = req.session.userId
    if (userId) {
        res.locals = {
            displayLink: true
        }
    } else {
        res.locals = {
            displayLink: false
        }
    }
    next();
});


sequelize.sync()
.then(() => {
    console.log("DB und Tabellen erstellt");
})
.catch((error) => {
    console.log(error)
});


APP.get("/", (req, res) => {
    return Product.findAll({
        raw: true, // nur Data-Values zurückgeben
        attributes: ["id", "name", "image"]
    })
        .then(data => {
            res.render("index", { items: data })
        });
});

APP.get("/product/:idP", (req, res) => {
    let aktID = parseInt(req.params.idP);
    if (!aktID) {
        res.send("Error");
    } else {
        return Product.findOne({
            raw: true, // nur Data-Values
            attributes: ["id", "name", "description", "price", "image", "menge"],
            where: {
                id: aktID
            }
        })
            .then(data => {
                res.render("product", { product: data })

            });
    }
});


APP.get("/neuproduct", (req, res) => {
    if (req.session.userId) {
        res.render("neuproduct")
    } else {
        res.redirect("/login")
    }
});


APP.get("/login", (req, res) => {
    res.render("login")
});

APP.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    })
});

APP.post("/login", (req, res) => {
    let { username, password } = req.body
    User.findOne({
        raw: true, // nur Data-Values
        attributes: ["id", "username", "password"],
        where: {
            username: username,
            password: password
        }
    })
    .then(data => {
        if (data) {
            console.log("Du hast richtig eingeschrieben");
            req.flash("info", `Willkommen "${data.username}"`)
            req.session.userId = data.id
            res.redirect("/")
        }
        else {
            req.flash("info2", `Der eingegebene Benutzername oder das Passwort ist falsch.`)
            console.log("Dein Username oder Password ist falsch");
            res.redirect("/login")
        }
    });
});

APP.get("/productliste", (req, res) => {
    if (req.session.userId) {
        return Product.findAll({
            raw: true, // nur Data-Values zurückgeben
            attributes: ["id", "name", "price", "menge"]
        })
            .then((data)=> {
                res.render("productliste", { items: data })
            });
    }else{
        res.redirect("/login")
    }
});

APP.get("/versand", (req, res) => {
    if (req.session.userId) {
        return Product.findAll({
            raw: true, // nur Data-Values zurückgeben
            attributes: ["id", "name", "price", "menge"]
        })
            .then(data => {
                res.render("versand", { items: data })
            });
    } else {
        res.redirect("/login")
    }
});

APP.get("/aufnahme", (req, res) => {
    if (req.session.userId) {
        return Product.findAll({
            raw: true, // nur Data-Values zurückgeben
            attributes: ["id", "name", "price", "menge"]
        })
            .then(data => {
                res.render("aufnahme", { items: data })
            });
    } else {
        res.redirect("/login")
    }
});

APP.post("/productversand", (req, res) => {
    Product.findOne({
        raw: true, // nur Data-Values zurückgeben
        attributes: ["id", "name", "price", "menge"],
        where: {
            name: req.body.name
        }
    })
        .then(data => {
           if(data.menge >= req.body.menge) {
               Product.update(
                {
                    menge: parseInt(data.menge) - parseInt(req.body.menge)
                },
                {
                    where: {
                        id: data.id
                    }
                });
                req.flash("info", `${req.body.menge} Stück ${data.name} erfolgreich versendet`)
            }else{
                req.flash("info2", "Es können nicht mehr Artikel versendet werden, als auf Lager sind ")
            }
        })
        .then(() => {
            res.redirect("/")
        });

});

APP.post("/productaufnahme", (req, res) => {
    Product.findOne({
        raw: true, // nur Data-Values zurückgeben
        attributes: ["id", "name", "price", "menge"],
        where: {
            name: req.body.name
        }
    })
        .then(data => {
            Product.update(
                {
                    menge: parseInt(data.menge) + parseInt(req.body.menge)
                },
                {
                    where: {
                        id: data.id
                    }
                })
            req.flash("info", `${req.body.menge} Stück ${data.name} wurde erfolgreich        erhalten`)
        })
        .then(() => {
            res.redirect("/")
        });

});

// const multer = require("multer");
// const fileStorage = multer.diskStorage({
//     destination:    function(req,file,cb) {
//         cb(null, __dirname + "/public/images/");
//     },
//     filename:   function(req,file,cb) {
//         cb(null,file.originalname);
//     }
// });

// const upload = multer({storage: fileStorage});  upload.single("image"),

APP.post("/neuproduct", (req, res) => {
    let kontrol = 0;
    Product.findAll({
        raw: true, // nur Data-Values zurückgeben
        attributes: ["name"],
    }).then((products) => {
        products.forEach(product =>{
            if(product.name == req.body.name){
                kontrol ++;
            }
        })
    }).then(() => {
        if(kontrol == 0){
            let myimage = req.files.image;
            myimage.mv(path.resolve(__dirname, './public/images/', myimage.name));

            Product.create({
                ...req.body,
                image: req.files.image.name
            })
            .then(() => {
                req.flash('info', `Das Produkt "${req.body.name}" wurde erfolgreich registriert`);
                res.redirect("/");
            })
        }else{
            req.flash('info2', `Es gibt schon ein Produkt mit dem Namen "${req.body.name}"`);
            res.redirect("/");
        }
    })
    
});

APP.delete("/productliste/delete/:id", (req, res) => {
    Product.findOne({
        where: {
            id: req.params.id
        }
    }).then((product) => {
        req.flash("info2", `Das Produkt "${product.name}" wurde gelöscht`)
    }).then(() =>{
        Product.destroy({
            where: {
                id: req.params.id
            }
        })
    }).then(() => {
        res.redirect("/");
    })
});

APP.get("/update/:id", (req, res) => {
    if (req.session.userId) {
        Product.findOne({
            where: {
                id: req.params.id
            }
        }).then((product) => {
            res.render("productupdate", { product: product });
        })
    }else{
        res.redirect("/login")
    }
});

APP.put("/update/:id", (req, res) => {

    let myimage = req.files.image;
    myimage.mv(path.resolve(__dirname, './public/images/', myimage.name));
    Product.update(
        {
            ...req.body,
            image: req.files.image.name
        },
        {
            where: {
                id: req.params.id
            }
        }
    ).then(() => {
        req.flash('info', `Das Produkt "${req.body.name}" wurde erfolgreich aktualisiert`);
        res.redirect("/")
    })
});


APP.get("/search", (req, res) => {
    if(req.session.userId){
        let gefundeneproduct = []
        if (req.query.search) {
            Product.findAll({
                raw: true, // nur Data-Values zurückgeben
                attributes: ["id", "name", "price", "menge"],
            }).then((products) => {
                products.forEach(element => {
                    if ((String(element.name).toLowerCase()).includes((req.query.search).toLowerCase())) {
                        console.log(element.name.toUpperCase())
                        gefundeneproduct.push(element)
                    }
                });
            }).then(() => {
                req.flash('info', `${gefundeneproduct.length} Produkte gefunden`);
                res.render("productliste", { items: gefundeneproduct });
            })
        } else {
            res.redirect("/productliste")
        }
    }else{
        res.redirect("/login")
    }
})

// APP.get('/search', (request, response) => {
//     console.log("HOME SEARCH");
//     console.log(request.query.searchBox);
//     Equipments.findAll({
//         raw: true,
//         attributes: ["id", "name", "quantity", "price", "details"],
//         where: {
//             name: sequelize.where(sequelize.fn('LOWER', sequelize.col('name')), 'LIKE', '%' + request.query.searchBox.toLowerCase() + '%')
//         }

//     })
//         .then(function (obj) {
//             console.log("------", obj);
//             response.render("home", { products: obj });
//         })
// });


APP.listen(PORT, IP, () => console.log(`Server: http://${IP}:${PORT}/`));
