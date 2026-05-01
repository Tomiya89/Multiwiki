import React, { useMemo, useRef } from 'react';
import ReactQuill, { Quill } from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

import ImageResize from './ImageResizeModule';

import "./Editor.css";
import ApiClient from '../services/ApiClient';
import Image, { getFullImageURL } from '../entities/Image';

if (!Quill.imports['modules/imageResize']) {
    Quill.register('modules/imageResize', ImageResize as any);
}

const Parchment = Quill.import('parchment');
const ImageFormat = Quill.import('formats/image');

const WidthStyle = new Parchment.StyleAttributor('width', 'width', {
    scope: Parchment.Scope.INLINE
});
const HeightStyle = new Parchment.StyleAttributor('height', 'height', {
    scope: Parchment.Scope.INLINE
});

Quill.register(WidthStyle, true);
Quill.register(HeightStyle, true);

class CustomImage extends (ImageFormat as any) {
    static formats(domNode: HTMLElement) {
        let formats = super.formats(domNode);
        if (domNode.hasAttribute('style')) {
            formats.width = domNode.style.width;
            formats.height = domNode.style.height;
        }
        return formats;
    }
    static value(domNode: HTMLElement) {
        const value = super.value(domNode);
        if (domNode.hasAttribute('style')) { }
        return value;
    }

    format(name: string, value: any) {
        if (name === 'width' || name === 'height') {
            if (value) {
                this.domNode.style[name] = value;
                this.domNode.setAttribute(name, value.replace('px', ''));
            } else {
                this.domNode.style.removeProperty(name);
                this.domNode.removeAttribute(name);
            }
        } else {
            super.format(name, value);
        }
    }
}
Quill.register('formats/image', CustomImage, true);

function Editor({ value, onChange, placeholder }: any) {
    const quillRef = useRef<ReactQuill>(null);

    const imageHandler = () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files ? input.files[0] : null;
            if (!file) return;

            const formData = new FormData();
            formData.append('file', file);
            
            try {
                const response = await ApiClient.post<Image>('/images/upload', formData);

                const imageUrl = getFullImageURL(response);

                if (imageUrl) {
                    const quill = quillRef.current?.getEditor();
                    const range = quill?.getSelection();

                    if (range) {
                        quill.insertEmbed(range.index, 'image', imageUrl);
                        quill.setSelection(range.index + 1);
                    }
                }
            } catch (error) {
                console.error("Ошибка при загрузке изображения:", error);
            }
        };
    };

    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                [{ 'font': [] }],
                [{ 'size': ['small', false, 'large', 'huge'] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'script': 'sub' }, { 'script': 'super' }],
                ['blockquote', 'code-block'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
                [{ 'direction': 'rtl' }, { 'align': [] }],
                ['link', 'image', 'video'],
                ['clean']
            ],
            handlers: {
                image: imageHandler
            }
        },
        imageResize: {},
    }), []);
    
    const formats = [
        'header', 'font', 'size',
        'bold', 'italic', 'underline', 'strike', 'color', 'background',
        'script', 'blockquote', 'code-block',
        'list', 'bullet', 'indent',
        'direction', 'align',
        'link', 'image', 'video', 'width', 'height'
    ];

    return (
        <div className="rich-editor">
            <ReactQuill
                ref={quillRef}
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
            />
        </div>
    );
}

export default Editor;