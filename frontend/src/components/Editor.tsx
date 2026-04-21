import React, { useMemo, useRef } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import ApiClient from '../services/ApiClient';
import { getFullImageURL } from '../entities/Image';
import Image from '../entities/Image';

interface EditorProps {
    value: string;
    onChange: (content: string) => void;
    placeholder?: string;
}

const Editor: React.FC<EditorProps> = ({ value, onChange, placeholder }) => {
    const quillRef = useRef<ReactQuill>(null);

    const imageHandler = () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files ? input.files[0] : null;
            if (file) {
                const formData = new FormData();
                formData.append('file', file);

                try {
                    const response = await ApiClient.post<Image>(
                        '/images/upload',
                        formData
                    );

                    const url = getFullImageURL(response);

                    const quill = quillRef.current?.getEditor();
                    if (quill) {
                        const range = quill.getSelection();
                        if (range) {
                            quill.insertEmbed(range.index, 'image', url);
                        }
                    }
                } catch (error) {
                    console.error('Upload failed:', error);
                }
            }
        };
    };

    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'align': [] }],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                ['link', 'image'],
                ['clean']
            ],
            handlers: {
                image: imageHandler 
            }
        }
    }), []);

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike',
        'align',
        'list', 'bullet',
        'link', 'image'
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
                style={{ height: '400px', marginBottom: '50px' }}
            />

            <style>{`
                .rich-editor .ql-container {
                    border-bottom-left-radius: 12px;
                    border-bottom-right-radius: 12px;
                    background: rgba(255, 255, 255, 0.5);
                    font-size: 1.1rem;
                    backdrop-filter: blur(5px);
                }
                .rich-editor .ql-toolbar {
                    border-top-left-radius: 12px;
                    border-top-right-radius: 12px;
                    background: #f8f9fa;
                    border-bottom: none;
                }
                .ql-editor {
                    min-height: 350px;
                }
                .ql-editor img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 8px;
                }
            `}</style>
        </div>
    );
};

export default Editor;