export interface HeadingItem {
    id: string;
    text: string;
    level: string;
}

function parseHeadings(html: string) {
    if (!html) return { processedHtml: '', headings: [] };

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const links = doc.querySelectorAll('a');
    links.forEach(link => {
        const href = link.getAttribute('href') || '';
        if (href.includes('youtube.com/embed/') || href.includes('youtu.be')) {
            const iframe = doc.createElement('iframe');
            iframe.setAttribute('src', href);
            iframe.setAttribute('class', 'ql-video');
            iframe.setAttribute('allowfullscreen', 'true');
            iframe.setAttribute('frameborder', '0');

            const wrapper = doc.createElement('div');
            wrapper.className = 'video-wrapper my-4';
            wrapper.appendChild(iframe);
            link.parentNode?.replaceChild(wrapper, link);
        }
    });

    const allHeadings = Array.from(doc.querySelectorAll('h1, h2, h3'));
    allHeadings.forEach(h => {
        if (!h.textContent?.trim()) {
            h.remove();
        }
    });

    const validHeadings = Array.from(doc.querySelectorAll('h1, h2, h3'));
    const headings: HeadingItem[] = validHeadings.map((el, i) => {
        const id = `section-${i}`;
        el.setAttribute('id', id);
        return {
            id,
            text: el.textContent?.trim() || '',
            level: el.tagName.toLowerCase()
        };
    });

    return {
        processedHtml: doc.body.innerHTML,
        headings
    };
}

export default parseHeadings;