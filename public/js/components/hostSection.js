import { createElement } from '../reusable/functions.js';

export function createHostSection(property) {
    const hostContainer = createElement('div', {
        className: 'host-section',
    });

    const hostImage = createElement('img', {
        className: 'host-image',
        src: property.host_image_url,
        alt: `${property.host_first_name} ${property.host_last_name}`,
    });

    const hostInfo = createElement('div', {
        className: 'host-info',
    });

    const hostName = createElement('p', {
        className: 'host-name',
        textContent: `Hosted by ${property.host_first_name} ${property.host_last_name}`,
    });

    const messageHost = createElement('button', {
        className: 'message-host',
        textContent: 'Message',
    });

    const hostDetails = createElement('p', {
        className: 'host-details',
        textContent: 'Host',
    });

    hostInfo.append(hostName, hostDetails);
    hostContainer.append(hostImage, hostInfo, messageHost);

    return hostContainer;
}
