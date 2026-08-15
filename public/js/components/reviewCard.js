import { createElement } from '../reusable/functions.js';

export function createReviewCard(review) {
    const card = createElement('div', {
        className: 'review-card',
    });

    const userSection = createElement('div', {
        className: 'review-user',
    });

    const userImage = createElement('img', {
        className: 'review-user-image',
        src: review.user_image_url,
        alt: `${review.user_first_name} ${review.user_last_name}`,
    });

    const userInfo = createElement('div', {
        className: 'review-user-info',
    });

    const userName = createElement('p', {
        className: 'review-user-name',
        textContent: `${review.user_first_name} ${review.user_last_name}`,
    });

    const reviewDate = new Date(review.created_at);

    const formattedDate = reviewDate.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
    });

    const reviewInfo = createElement('p', {
        className: 'review-info',
        textContent: `★ ${review.rating} · ${formattedDate}`,
    });

    const comment = createElement('p', {
        className: 'review-comment',
        textContent: review.comment,
    });

    userInfo.append(userName, reviewInfo);

    userSection.append(userImage, userInfo);

    card.append(userSection, comment);

    return card;
}
