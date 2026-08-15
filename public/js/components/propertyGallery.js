import { createElement } from '../reusable/functions.js';

export function createPropertyGallery(images) {
    let currentIndex = 0;

    const gallery = createElement('div', {
        className: 'property-gallery',
    });

    const image = createElement('img', {
        src:
            images[currentIndex]?.image_url ||
            '/assets/placeholders/default_home.jpg',
        alt: 'Property image',
        className: 'property-gallery-image',
    });

    const leftButton = createElement('button', {
        className: 'gallery-btn-left',
        textContent: '‹',
    });

    const rightButton = createElement('button', {
        className: 'gallery-btn-right',
        textContent: '›',
    });

    const imageCount = createElement('span', {
        className: 'image-count',
        textContent: `1 / ${images.length}`,
    });

    function updateImage() {
        image.src =
            images[currentIndex]?.image_url ||
            '/assets/placeholders/default_home.jpg';
        imageCount.textContent = `${currentIndex + 1} / ${images.length}`;
    }

    leftButton.addEventListener('click', () => {
        currentIndex--;
        if (currentIndex < 0) {
            currentIndex = images.length - 1;
        }

        updateImage();
    });

    rightButton.addEventListener('click', () => {
        currentIndex++;
        if (currentIndex > images.length - 1) {
            currentIndex = 0;
        }

        updateImage();
    });

    gallery.append(image, leftButton, rightButton, imageCount);

    return gallery;
}
