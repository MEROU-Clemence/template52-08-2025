$(document).ready(function () {
    // ****** Variables globales pour les sélecteurs
    const $description = $('.description');

    // ****** Texte présentation page Home
    function initDescriptionToggle() {
        if ($description.length) {
            const $seeMore2 = $('#seeMore2');
            const $seeLess2 = $('#seeLess2');

            // Vérifie hauteur description
            if ($description[0].scrollHeight <= $description.height()) {
                $seeMore2.hide();
                $seeLess2.hide();
            } else {
                $seeMore2.show();
                $seeLess2.hide();
            }

            // Voir plus
            $seeMore2.on('click', function (e) {
                e.preventDefault();
                $description.css('height', 'auto').addClass('expanded');
                $seeMore2.hide();
                $seeLess2.show();
            });

            // Voir moins
            $seeLess2.on('click', function (e) {
                e.preventDefault();
                $description.css('height', '').removeClass('expanded');
                $seeMore2.show();
                $seeLess2.hide();
            });
        }
    }

    // ****** Slider Galerie
    function initSliderGallery() {
        const sliderGallery = document.querySelector(".slider-gallery");
        const slides = Array.from(sliderGallery.querySelectorAll(".slide-gallery"));
        const currentPhotoContainer = document.querySelector(".current-photo-container");
        const totalPhotosElement = document.querySelector(".total-photos");
        const totalPhotos = slides.length;
        // Maximum de slides visibles simultanément
        const maxVisibleSlides = 7;
        // Intervalle normal (3 secondes)
        const normalInterval = 3000;
        // Intervalle au survol (5 secondes)
        const hoverInterval = 5000;
        let currentIndex = 0;
        let autoPlayInterval;
        let isHovering = false;

        // Calculer la largeur optimale de l'image active
        function calculateActiveWidth() {
            // Largeur fixe pour les images inactives (7%)
            const inactiveWidth = 7;

            // Espace occupé par le gap (2% entre chaque slide)
            const gapSpace = (Math.min(totalPhotos, maxVisibleSlides) - 1) * 2;

            // Nombre d'images visibles inactives
            let visibleInactiveSlides = Math.min(totalPhotos - 1, maxVisibleSlides - 1);

            // Calcul de l'espace disponible pour l'image active
            const availableSpace = 100 - (visibleInactiveSlides * inactiveWidth) - gapSpace;

            // Au moins 50% pour l'image active
            return Math.max(availableSpace, 50);
        }

        // Définir la largeur active calculée comme variable CSS
        const activeWidth = calculateActiveWidth();
        sliderGallery.style.setProperty('--active-width', activeWidth + '%');
        sliderGallery.style.setProperty('--inactive-width', '7%');

        //Initialiser le total des photos
        totalPhotosElement.textContent = String(totalPhotos).padStart(2, "0");

        // Initialiser uniquement si nécessaire
        if (currentPhotoContainer && !currentPhotoContainer.querySelector('.slide-number')) {
            currentPhotoContainer.innerHTML = '<span class="slide-number current">01</span>';
        }

        // Fonction pour mettre à jour l'indicateur de slide avec animation
        function updateSlideIndicator(newIndex) {
            if (!currentPhotoContainer) return;
            // Récupérer le nombre actuel
            const currentNumber = currentPhotoContainer.querySelector('.slide-number.current');
            if (!currentNumber) return;
            // Nettoyer les anciens éléments
            currentPhotoContainer.querySelectorAll('.slide-number:not(.current)').forEach(el => el.remove());
            // Créer le nouveau nombre (indexé à partir de 1)
            const newNumber = document.createElement('span');
            newNumber.className = 'slide-number next';
            newNumber.textContent = String(newIndex + 1).padStart(2, "0");
            // Ajouter le nouveau nombre au conteneur
            currentPhotoContainer.appendChild(newNumber);
            // Déclencher le repaint pour assurer que la transition fonctionne
            void currentPhotoContainer.offsetWidth;
            // Animation
            currentNumber.classList.replace('current', 'prev');
            newNumber.classList.replace('next', 'current');
            // Nettoyer après l'animation
            setTimeout(() => currentNumber.remove(), 300);
        }            

        // Fonction pour gérer la visibilité des slides
        function updateVisibility(newIndex) {
            // Si totalPhotos <= maxVisibleSlides, tous les slides sont visibles
            if (totalPhotos <= maxVisibleSlides) {
                slides.forEach(slide => {
                    slide.classList.remove("hidden");
                    slide.style.display = "";
                });
                return;
            }

            // Calculer les slides à afficher (centrés autour de l'actif)
            let visibleIndices = [];
            const halfVisible = Math.floor((maxVisibleSlides - 1) / 2);

            // Ajouter les slides avant l'actif
            for (let i = 1; i <= halfVisible; i++) {
                const prevIndex = (newIndex - i + totalPhotos) % totalPhotos;
                visibleIndices.push(prevIndex);
            }

            // Ajouter le slide actif
            visibleIndices.push(newIndex);

            // Ajouter les slides après l'actif
            for (let i = 1; i <= maxVisibleSlides - 1 - halfVisible; i++) {
                const nextIndex = (newIndex + i) % totalPhotos;
                visibleIndices.push(nextIndex);
            }

            // Mise à jour de la visibilité des slides
            slides.forEach((slide, index) => {
                if (visibleIndices.includes(index)) {
                    slide.classList.remove("hidden");
                    slide.style.display = "";
                }
                // Retiré du flux
                else {
                    slide.classList.add("hidden");
                    slide.style.display = "none";
                }
            });
        }

        // Fonction pour activer un slide spécifique
        function updateSlider(newIndex) {
            // Mise à jour de la visibilité des slides
            updateVisibility(newIndex);

            // Transition douce pour les slides
            slides.forEach(slide => slide.style.transition = "all 0.6s ease");

            // Réinitialiser toutes les images
            slides.forEach(slide => slide.classList.remove("active"));

            // Définir le nouveau slide actif
            slides[newIndex].classList.add("active");

            // Mettre à jour l'indicateur de slide avec animation
            updateSlideIndicator(newIndex);

            // Mettre à jour l'index courant
            currentIndex = newIndex;
        }

        // Réinitialiser l'intervalle en fonction de l'état de survol
        function resetInterval() {
            clearInterval(autoPlayInterval);
            const interval = isHovering ? hoverInterval : normalInterval;
            autoPlayInterval = setInterval(nextSlide, interval);
        }

        // Fonction pour passer au slide suivant
        function nextSlide() {
            updateSlider((currentIndex + 1) % totalPhotos);
        }

        // Ajouter les gestionnaires de clic
        slides.forEach((slide, index) => {
            slide.addEventListener("click", function () {
                updateSlider(index);

                // Réinitialiser l'intervalle de défilement automatique
                resetInterval();
            });
        });

        // Ajouter un gestionnaire de mouvement de souris global
        document.addEventListener('mousemove', function (e) {
            // Trouver le slide actif
            const activeSlide = document.querySelector('.slide-gallery.active');
            if (!activeSlide) return;

            // Vérifier si la souris est sur le slide actif
            const rect = activeSlide.getBoundingClientRect();
            const isMouseOverActive = (
                e.clientX >= rect.left &&
                e.clientX <= rect.right &&
                e.clientY >= rect.top &&
                e.clientY <= rect.bottom
            );

            // Si l'état a changé, mettre à jour et réinitialiser l'intervalle
            if (isMouseOverActive !== isHovering) {
                isHovering = isMouseOverActive;

                resetInterval();
            }
        });

        // Initialiser la visibilité des slides
        updateVisibility(0);

        // Mettre le premier slide comme actif par défaut
        updateSlider(0);

        // Permettre les transitions après le chargement initial
        setTimeout(() => {
            slides.forEach(slide => slide.style.transition = "all 0.6s ease");
        }, 100);

        // Démarrer le défilement automatique
        autoPlayInterval = setInterval(nextSlide, normalInterval);
    }

    // ****** Img météo affichage
    function initPictureMeteo() {
        // ****** METEO: Applique l'image de fond correspondante
        $('.weather-icon').each(function () {
            var $meteoModule = $(this).closest('.meteo-contain');
            var weatherIcon = $(this).attr('data');
            var baseUrl = $meteoModule.data('url');
            var iconPath = weatherIcon && weatherIcon.trim() !== ''
                ? baseUrl + weatherIcon + '.jpeg'
                : baseUrl + 'clear-day.jpeg';

            // Ajoute une classe basée sur l'icône météo (si `weatherIcon` est défini)
            if (weatherIcon && weatherIcon.trim() !== '') {
                $meteoModule.addClass('weather-' + weatherIcon);
            }

            // Applique l'image de fond à l'élément '.meteo'
            $meteoModule.css({
                'background-image': 'url(' + iconPath + ')',
                'background-size': 'cover'
            });
        });
    }

    // ****** Gestion des options SCEA
    function initSceaToggle() {
        const $optionsScea = $('.options-scea');
        const totalOptions = $optionsScea.length;

        // Afficher les 10 premiers éléments et cacher les autres
        $optionsScea.hide().slice(0, 10).show();

        // Si toutes les options sont déjà visibles, cacher le bouton "Voir plus"
        const visibleOptions = $optionsScea.filter(':visible').length;
        if (visibleOptions === totalOptions) {
            $('#seeMore1').hide();
        } else {
            $('#seeMore1').show();
        }

        $('#seeMore1').on('click', function (e) {
            e.preventDefault();

            $($optionsScea).slideDown();

            // Gestion des boutons
            $('#seeMore1').hide();
            $('#seeLess1').show();
        });

        $('#seeLess1').on('click', function (e) {
            e.preventDefault();

            $($optionsScea).not(":lt(10)").slideUp();

            // Gestion des boutons
            $('#seeMore1').show();
            $('#seeLess1').hide();
        });
    }

    // ****** Distance ajustée map & calendar positionnement
    function adjustWidthMapCalendar() {
        function adjustMapAndCalendar() {
            const container = document.querySelector('.section.section-map-and-calendar');
            const map = document.querySelector('.section-map');
            const calendar = document.querySelector('.calendars');

            if (!container || !map || !calendar) return;

            if (window.innerWidth >= 1220) {
                // Décalage gauche de la map par rapport au container
                const offsetLeft = map.getBoundingClientRect().left - container.getBoundingClientRect().left;

                // === MAP ===
                // Base width = 452px, on enlève offsetLeft
                const newMapWidth = 452 - offsetLeft;
                map.style.width = `${newMapWidth}px`;

                // === CALENDAR ===
                // Base width = 532px, on enlève offsetLeft
                const newCalWidth = `calc(100% - ${532 - offsetLeft}px)`;
                calendar.style.width = newCalWidth;
            } else {
                // Reset styles en dessous de 1220px
                map.style.width = '';
                calendar.style.width = '';
            }
        }

        // Initialisation
        window.addEventListener('load', adjustMapAndCalendar);
        window.addEventListener('resize', adjustMapAndCalendar);
    }

    // ****** Chèques cadeaux prix et slider
    function allPriceVouchersAndSlider() {
        // Clics sur les liens des prix chèques cadeaux
        $('.all-prices-vouchers a').on('click', function (event) {
            event.preventDefault();

            var targetId = $(this).attr('id');

            // Trouver l'élément correspondant dans le slider
            var targetElement = $(targetId);
            if (targetElement.length) {
                var index = $('.slider-vouchers').find('.owl-item').filter(function () {
                    return $(this).find(targetId).length > 0;
                }).index();

                // Si un index valide est trouvé, déplacer le slider
                if (index !== -1) {
                    $('.slider-vouchers').trigger('to.owl.carousel', [index, 600]);
                } else {
                    console.error("Impossible de trouver l'index dans Owl Carousel pour :", targetId);
                }
            } else {
                console.error("Cible non trouvée pour :", targetId);
            }
        });

        // ****** Slider vouchers
        $('.slider-vouchers').owlCarousel({
            loop: false,
            rewind: true,
            autoplay: false,
            autoHeight: true,
            responsiveClass: true,
            margin: 30,
            dots: true,
            nav: false,
            items: 1,
            responsive: {
                0: {
                    touchDrag: true,
                    mouseDrag: true,
                },
                1220: {
                    touchDrag: false,
                    mouseDrag: true,
                },
            }
        });
    }

    // ****** Initialisation des modules
    initDescriptionToggle();
    initSliderGallery();
    initPictureMeteo();
    initSceaToggle();
    adjustWidthMapCalendar();
    allPriceVouchersAndSlider();
});

$(document).ready(function () {
    $('.slider-options').owlCarousel({
        loop: false,
        rewind: true,
        autoplay: true,
        autoplayHoverPause: true,
        margin: 30,
        dots: true,
        nav: false,
        responsiveClass: true,
        responsive: {
            0: {
                items: 1,
                touchDrag: true,
                mouseDrag: true,
            },
            768: {
                items: 2,
                touchDrag: true,
                mouseDrag: true,
            },
            1220: {
                items: 3,
                touchDrag: false,
                mouseDrag: true,
            },
        }
    });
    $('.slider-giftcards').owlCarousel({
        loop: false,
        rewind: true,
        autoplay: true,
        autoplayHoverPause: true,
        margin: 30,
        dots: true,
        nav: false,
        responsiveClass: true,
        responsive: {
            0: {
                items: 1,
                touchDrag: true,
                mouseDrag: true,
            },
            768: {
                items: 2,
                touchDrag: true,
                mouseDrag: true,
            },
            1220: {
                items: 3,
                touchDrag: false,
                mouseDrag: true,
            },
        }
    });
    $('.slider-special-offers').owlCarousel({
        loop: false,
        rewind: true,
        autoplay: true,
        autoplayHoverPause: true,
        margin: 30,
        dots: true,
        nav: false,
        responsiveClass: true,
        responsive: {
            0: {
                items: 1,
                touchDrag: true,
                mouseDrag: true,
            },
            768: {
                items: 2,
                touchDrag: true,
                mouseDrag: true,
            },
            1220: {
                items: 2,
                touchDrag: false,
                mouseDrag: true,
            },
        }
    });
});