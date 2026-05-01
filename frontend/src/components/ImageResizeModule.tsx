import ReactQuill, { Quill } from 'react-quill-new';

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
            this.overlay!.appendChild(handle);
        });

        this.quill.root.parentNode.appendChild(this.overlay);
        this.reposition();
    }

    getCoords(elem: HTMLElement) {
        const box = elem.getBoundingClientRect();
        const body = document.body;
        const docEl = document.documentElement;

        const scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
        const scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

        const clientTop = docEl.clientTop || body.clientTop || 0;
        const clientLeft = docEl.clientLeft || body.clientLeft || 0;

        const top = box.top + scrollTop - clientTop;
        const left = box.left + scrollLeft - clientLeft;

        return { top: Math.round(top), left: Math.round(left), width: box.width, height: box.height };
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

    startResize = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation(); 

        const handle = e.target as HTMLElement;
        this.currentHandle = handle.getAttribute('data-handle');
        const coords = this.getCoords(this.img!);

        this.startParams = {
            x: e.clientX,
            y: e.clientY,
            w: coords.width,
            h: coords.height,
            top: coords.top,
            left: coords.left
        };
        document.body.classList.add(`ql-resizing-${this.currentHandle}`);

        document.addEventListener('mousemove', this.onMouseMove);
        document.addEventListener('mouseup', this.onMouseUp);
    };

    onMouseMove = (e: MouseEvent) => {
        if (!this.img || !this.currentHandle) return;

        const dx = e.clientX - this.startParams.x;
        const dy = e.clientY - this.startParams.y;

        let newWidth = this.startParams.w;
        let newHeight = this.startParams.h;

        switch (this.currentHandle) {
            case 'se':
                newWidth = this.startParams.w + dx;
                newHeight = this.startParams.h + dy;
                break;
            case 'sw':
                newWidth = this.startParams.w - dx;
                newHeight = this.startParams.h + dy;
                break;
            case 'ne':
                newWidth = this.startParams.w + dx;
                newHeight = this.startParams.h - dy;
                break;
            case 'nw':
                newWidth = this.startParams.w - dx;
                newHeight = this.startParams.h - dy;
                break;
            case 'n':
                newHeight = this.startParams.h - dy;
                break;
            case 's':
                newHeight = this.startParams.h + dy;
                break;
            case 'e':
                newWidth = this.startParams.w + dx;
                break;
            case 'w':
                newWidth = this.startParams.w - dx;
                break;
        }

        if (newWidth < 20) newWidth = 20;
        if (newHeight < 20) newHeight = 20;

        Object.assign(this.img.style, {
            width: `${newWidth}px`,
            height: `${newHeight}px`,
        });

        this.reposition();
    };

    onMouseUp = () => {
        if (this.currentHandle) {
            document.body.classList.remove(`ql-resizing-${this.currentHandle}`);
        }

        this.currentHandle = null;
        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('mouseup', this.onMouseUp);

        if (this.img) {
            const width = this.img.style.width;
            const height = this.img.style.height;

            const blot = Quill.find(this.img);
            if (blot) {
                this.quill.formatText(this.quill.getIndex(blot), 1, {
                    width: width,
                    height: height
                }, 'user');
            }
            setTimeout(() => {
                this.quill.update();
            }, 0);
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