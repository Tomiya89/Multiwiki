const FALLBACK_IMAGE = '/Multiwiki/public/default.jpg';

interface ImageElement extends HTMLImageElement {
    dataset: {
        fallbackAttempted?: string;
    };
    originalSrc?: string;
}

export const setupGlobalImageFallback = (): void => {
    const handleImageError = (event: Event | { target: HTMLImageElement }): void => {
        const img = event.target as ImageElement;

        if (img.dataset.fallbackAttempted === 'true') 
            return;

        img.dataset.fallbackAttempted = 'true';
        img.originalSrc = img.src;
        img.src = FALLBACK_IMAGE;
        img.classList.add('image-fallback');
        console.warn(`Failed to load image: ${img.originalSrc} (likely 403)`);
    };

    const setupImageErrorHandler = (img: HTMLImageElement): void => {
        if (img.complete && img.naturalWidth === 0)
            handleImageError({ target: img });

        img.removeEventListener('error', handleImageError as EventListener);
        img.addEventListener('error', handleImageError as EventListener);
    };
    document.querySelectorAll('img').forEach(setupImageErrorHandler);
    const observer = new MutationObserver((mutations: MutationRecord[]) => {
        mutations.forEach((mutation: MutationRecord) => {
            mutation.addedNodes.forEach((node: Node) => {
                if (node.nodeName === 'IMG') 
                    setupImageErrorHandler(node as HTMLImageElement);
            
                if (node instanceof Element && node.querySelectorAll) 
                    node.querySelectorAll('img').forEach(setupImageErrorHandler);
            });
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
};