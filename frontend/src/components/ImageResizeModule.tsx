import { Quill } from 'react-quill-new';

export default class ImageResize {
    quill: any;
    img: HTMLImageElement | null = null;
    overlay: HTMLDivElement | null = null;
    currentHandle: string | null = null;
    startParams = { x: 0, y: 0, w: 0, h: 0, top: 0, left: 0 };

    constructor(quill: any, options: any = {}) {
        this.quill = quill;
        if (this.quill.root) {
            this.init();
        } else {
            this.quill.on('text-change', () => this.init());
        }
    }

    init() {
        this.quill.root.addEventListener('click', this.handleClick, true);
        window.addEventListener('scroll', () => this.reposition(), true);
        window.addEventListener('resize', () => this.reposition());
    }

    private getClientPosition(e: MouseEvent | TouchEvent) {
        if ('touches' in e) {
            return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
        return { x: e.clientX, y: e.clientY };
    }

    handleClick = (evt: MouseEvent) => {
        const target = evt.target as HTMLElement;
        if (target && target.tagName === 'IMG') {
            if (this.img === target) return;
            this.show(target as HTMLImageElement);
        } else if (!target.classList.contains('resize-handle'))
            this.hide();
    };

    show(img: HTMLImageElement) {
        this.img = img;
        this.showOverlay();
    }

    showOverlay() {
        if (this.overlay) this.hide();

        this.overlay = document.createElement('div');
        this.overlay.className = 'ql-image-resizer-overlay';
        const positions = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];

        positions.forEach(pos => {
            const handle = document.createElement('div');
            handle.className = `resize-handle handle-${pos}`;
            handle.setAttribute('data-handle', pos);

            handle.addEventListener('mousedown', this.startResize);
            handle.addEventListener('touchstart', this.startResize, { passive: false });
            this.overlay!.appendChild(handle);
        });

        this.quill.root.parentNode.appendChild(this.overlay);
        this.reposition();
    }

    reposition = () => {
        if (!this.img || !this.overlay) return;
        const rect = this.img.getBoundingClientRect();
        const parentRect = this.quill.root.parentNode.getBoundingClientRect();

        Object.assign(this.overlay.style, {
            position: 'absolute',
            top: `${rect.top - parentRect.top + this.quill.root.parentNode.scrollTop}px`,
            left: `${rect.left - parentRect.left}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`,
            display: 'block',
            zIndex: '100',
        });
    };

    startResize = (e: MouseEvent | TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const handle = e.target as HTMLElement;
        this.currentHandle = handle.getAttribute('data-handle');
        const pos = this.getClientPosition(e);
        const rect = this.img!.getBoundingClientRect();

        this.startParams = {
            x: pos.x,
            y: pos.y,
            w: rect.width,
            h: rect.height,
            top: rect.top,
            left: rect.left
        };

        document.body.classList.add(`ql-resizing-${this.currentHandle}`);

        document.addEventListener('mousemove', this.onMove);
        document.addEventListener('touchmove', this.onMove, { passive: false });
        document.addEventListener('mouseup', this.onEnd);
        document.addEventListener('touchend', this.onEnd);
    };

    onMove = (e: MouseEvent | TouchEvent) => {
        if (!this.img || !this.currentHandle) return;
        e.preventDefault();

        const pos = this.getClientPosition(e);
        const dx = pos.x - this.startParams.x;
        const dy = pos.y - this.startParams.y;

        let newWidth = this.startParams.w;
        let newHeight = this.startParams.h;

        switch (this.currentHandle) {
            case 'se': newWidth += dx; newHeight += dy; break;
            case 'sw': newWidth -= dx; newHeight += dy; break;
            case 'ne': newWidth += dx; newHeight -= dy; break;
            case 'nw': newWidth -= dx; newHeight -= dy; break;
            case 'n': newHeight -= dy; break;
            case 's': newHeight += dy; break;
            case 'e': newWidth += dx; break;
            case 'w': newWidth -= dx; break;
        }

        if (newWidth < 20) newWidth = 20;
        if (newHeight < 20) newHeight = 20;

        Object.assign(this.img.style, {
            width: `${newWidth}px`,
            height: `${newHeight}px`,
        });

        this.reposition();
    };

    onEnd = () => {
        if (this.currentHandle) {
            document.body.classList.remove(`ql-resizing-${this.currentHandle}`);
        }

        this.currentHandle = null;
        document.removeEventListener('mousemove', this.onMove);
        document.removeEventListener('touchmove', this.onMove);
        document.removeEventListener('mouseup', this.onEnd);
        document.removeEventListener('touchend', this.onEnd);

        if (this.img) {
            const blot = Quill.find(this.img);
            if (blot) {
                this.quill.formatText(this.quill.getIndex(blot), 1, {
                    width: this.img.style.width,
                    height: this.img.style.height
                }, 'user');
            }
        }
    };

    hide() {
        if (this.overlay) {
            this.overlay.remove();
            this.overlay = null;
        }
        this.img = null;
    }
}