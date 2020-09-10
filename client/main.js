// UI CONTROLLER
var UIController = (function () {
    const DOMstrings = {
        offersContainer: '.offers-container',
        updateOffersButton: '.buttons-container button.btn--default',
    };

    function newEl(type, attrs = {}) {
        const el = document.createElement(type);

        for (let attr in attrs) {
            const value = attrs[attr];
            if (attr == 'innerText') el.innerText = value;
            else el.setAttribute(attr, value);
        }

        return el;
    }

    return {
        domStrings: DOMstrings,
        renderOffersList: function (offers) {
            // Add offer elements to offers container.
            const offersContainer = document.querySelector(UIController.domStrings.offersContainer);

            offersContainer.innerHTML = '';
            offers.forEach(offer => {
                const offerItem = UIController.renderOffer(offer);
                offersContainer.appendChild(offerItem);
            });
        },
        renderOffer: function (offer) {
            let offerCard = newEl('div', {class: 'offer-card'});

            let link = newEl('a', {class: 'offer-card__link', href: offer.link, target: '_blank'});

            let imgContainer = newEl('div', {class: 'offer-card__image'});
            let img = newEl('img', {src: offer.imageSrc});
            imgContainer.appendChild(img);
            link.appendChild(imgContainer);

            let infoContainer = newEl('div', {class: 'offer-card__info'});
            let title = newEl('div', {class: 'offer-card__title', innerText: offer.title});
            let price = newEl('div', {class: 'offer-card__price', innerText: offer.price});
            infoContainer.appendChild(title);
            infoContainer.appendChild(price);
            link.appendChild(infoContainer);

            let address = newEl('div', {class: 'offer-card__address', innerText: offer.address});
            let description = newEl('div', {
                class: 'offer-card__description',
                innerText: offer.description
            });
            link.appendChild(address);
            link.appendChild(description);

            offerCard.appendChild(link);

            return offerCard;
        },
    };
})();

/* Global app controller */
const AppController = (function () {
    function attachEventListeners() {
        const updateOffersButton = document.querySelector(UIController.domStrings.updateOffersButton);

        // Attach updated offers button event listener.
        updateOffersButton.addEventListener('click', handleUpdateOffersButton);
    }

    async function handleUpdateOffersButton() {
        // Call scrape offers endpoint.
        const res = await fetch('http://localhost:3000/scrape-offers');
        const offers = await res.json();
        UIController.renderOffersList(offers);
    }

    async function loadOffers() {
        // Fetch saved offers.
        const res = await fetch('http://localhost:3000/offers');
        const offers = await res.json();
        UIController.renderOffersList(offers);
    }

    return {
        init: function () {
            attachEventListeners();
            loadOffers();
        },
    }
})();

AppController.init();
