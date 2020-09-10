const typeorm = require('typeorm');
const EntitySchema = require("typeorm").EntitySchema;

async function getConnection() {
    return await typeorm.createConnection({
        type: "mysql",
        host: "localhost",
        port: 3306,
        username: "root",
        password: "",
        database: "rentrack",
        synchronize: true,
        logging: false,
        entities: [
            OfferSchema
        ]
    })
}

class Offer {
    constructor(id, title, description, address, price, link, imageSrc) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.link = link;
        this.imageSrc = imageSrc;
        this.address = address;
        this.price = price;
    }
}

const OfferSchema = new EntitySchema({
    name: "Offer",
    target: Offer,
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true
        },
        title: {
            type: "varchar"
        },
        description: {
            type: "text"
        },
        address: {
            type: "text"
        },
        price: {
            type: "text"
        },
        link: {
            type: "text"
        },
        imageSrc: {
            type: "text"
        }
    }
});

async function getOffers() {
    const connection = await getConnection();
    const offersRepo = connection.getRepository(Offer);
    const allOffers = await offersRepo.find();

    connection.close();
    return allOffers;
}

async function updateOffers(offers) {
    const connection = await getConnection();

    // Remove all old offers from db.
    const offersRepo = await connection.getRepository(Offer);
    const allOffers = await offersRepo.find();
    await offersRepo.remove(allOffers);

    // Save offers to db.
    for (const _offer of offers) {
        const offer = new Offer();
        offer.title = _offer.title;
        offer.description = _offer.description;
        offer.address = _offer.address;
        offer.price = _offer.price;
        offer.link = _offer.link;
        offer.imageSrc = _offer.imageSrc;

        const offerRepo = connection.getRepository(Offer);
        await offerRepo.save(offer);
    }

    connection.close();
}

module.exports = {
    getOffers: getOffers,
    updateOffers: updateOffers,
}
