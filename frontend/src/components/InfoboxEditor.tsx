import React from 'react';
import { FiPlus, FiTrash2, FiImage, FiInfo, FiList } from 'react-icons/fi';
import { useLocale } from '../contexts/LocaleContext';
import ApiClient from '../services/ApiClient';
import { getFullImageURL } from '../entities/Image';
import type Image from '../entities/Image';

interface SectionItem {
    image: string;
    name: string;
    wikiLink: string;
}

interface InfoboxSection {
    title: string;
    items: SectionItem[];
}

interface InfoboxField {
    key: string;
    value: string;
}

interface InfoboxData {
    mainImage: string | null;
    fields: InfoboxField[];
    sections: InfoboxSection[];
}

interface Props {
    data: InfoboxData;
    onChange: (newData: InfoboxData) => void;
}

const InfoboxEditor: React.FC<Props> = ({ data, onChange }) => {
    const { getTranslate } = useLocale();

    const uploadPhoto = async (callback: (url: string) => void) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async () => {
            if (input.files?.[0]) {
                const fd = new FormData();
                fd.append('file', input.files[0]);
                try {
                    const res = await ApiClient.post<Image>('/images/upload', fd);
                    callback(getFullImageURL(res));
                } catch (err) {
                    alert(getTranslate('UPLOAD_PHOTO_ERROR'));
                }
            }
        };
        input.click();
    };

    const updateData = (patch: Partial<InfoboxData>) => {
        onChange({ ...data, ...patch });
    };

    return (
        <div className="card border-0 shadow-sm rounded-4 p-3 bg-white sticky-top" style={{ top: '20px', zIndex: 10 }}>
            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2 text-primary">
                <FiInfo /> {getTranslate('infoboxSettings')}
            </h6>

            <div className="mb-4 text-center border rounded-4 p-2 bg-light position-relative" style={{ minHeight: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {data.mainImage ? (
                    <div className="position-relative w-100">
                        <img src={data.mainImage} className="img-fluid rounded-3 shadow-sm" alt="Preview" style={{ maxHeight: '200px' }} />
                        <button className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2 rounded-circle shadow" onClick={() => updateData({ mainImage: null })}>
                            <FiTrash2 size={14} />
                        </button>
                    </div>
                ) : (
                    <button className="btn btn-sm btn-outline-primary border-dashed w-100 py-4 rounded-3" onClick={() => uploadPhoto(url => updateData({ mainImage: url }))}>
                        <FiImage className="me-2" size={20} /> {getTranslate('addCover')}
                    </button>
                )}
            </div>
            <div className="mb-4">
                <label className="small fw-bold text-muted text-uppercase mb-2 d-block">{getTranslate('mainData')}</label>
                {data.fields.map((f, i) => (
                    <div key={i} className="d-flex gap-1 mb-2 align-items-center">
                        <input className="form-control form-control-sm border-light bg-light" placeholder={getTranslate('property')} value={f.key} onChange={e => {
                            const n = [...data.fields]; n[i].key = e.target.value; updateData({ fields: n });
                        }} />
                        <input className="form-control form-control-sm border-light bg-light" placeholder={getTranslate('value')} value={f.value} onChange={e => {
                            const n = [...data.fields]; n[i].value = e.target.value; updateData({ fields: n });
                        }} />
                        <button className="btn btn-link text-danger p-1" onClick={() => updateData({ fields: data.fields.filter((_, idx) => idx !== i) })}><FiTrash2 /></button>
                    </div>
                ))}
                <button className="btn btn-sm btn-outline-secondary w-100 mt-1 border-dashed" onClick={() => updateData({ fields: [...data.fields, { key: '', value: '' }] })}>
                    <FiPlus className="me-1" /> {getTranslate('addFieldBtn')}
                </button>
            </div>

            <hr className="my-4 opacity-25" />

            <div className="sections-container">
                <label className="small fw-bold text-muted text-uppercase mb-3 d-flex justify-content-between align-items-center">
                    {getTranslate('objectCategories')} <FiList className="text-primary" />
                </label>

                {data.sections.map((section, sIdx) => (
                    <div key={sIdx} className="section-block border rounded-4 p-2 mb-4 bg-white shadow-sm">
                        <div className="d-flex gap-2 mb-2 p-1 align-items-center border-bottom pb-2">
                            <input
                                className="form-control form-control-sm border-0 fw-bold text-primary bg-transparent"
                                placeholder={getTranslate("header")}
                                value={section.title}
                                onChange={e => {
                                    const n = [...data.sections]; n[sIdx].title = e.target.value; updateData({ sections: n });
                                }}
                            />
                            <button className="btn btn-sm btn-outline-danger border-0" onClick={() => updateData({ sections: data.sections.filter((_, i) => i !== sIdx) })}>
                                <FiTrash2 size={14} />
                            </button>
                        </div>

                        <div className="items-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {section.items.map((item, iIdx) => (
                                <div key={iIdx} className="bg-light rounded-3 p-2 mb-2 border border-white transition-all item-card">
                                    <div className="row g-2 align-items-center">
                                        <div className="col-auto">
                                            <div
                                                className="bg-white rounded-2 border d-flex align-items-center justify-content-center"
                                                style={{ width: '42px', height: '42px', cursor: 'pointer', overflow: 'hidden' }}
                                                onClick={() => uploadPhoto(url => {
                                                    const n = [...data.sections]; n[sIdx].items[iIdx].image = url; updateData({ sections: n });
                                                })}
                                            >
                                                {item.image ? <img src={item.image} className="w-100 h-100 object-fit-cover" /> : <FiImage className="text-muted opacity-25" />}
                                            </div>
                                        </div>
                                        <div className="col">
                                            <input className="form-control form-control-sm border-0 bg-transparent fw-bold p-0" placeholder={getTranslate("name")} value={item.name} onChange={e => {
                                                const n = [...data.sections]; n[sIdx].items[iIdx].name = e.target.value; updateData({ sections: n });
                                            }} />
                                            <input className="form-control form-control-sm border-0 bg-transparent p-0 text-muted small" placeholder={getTranslate("url")} value={item.wikiLink} onChange={e => {
                                                const n = [...data.sections]; n[sIdx].items[iIdx].wikiLink = e.target.value; updateData({ sections: n });
                                            }} />
                                        </div>
                                        <div className="col-auto">
                                            <button className="btn btn-link text-danger p-1" onClick={() => {
                                                const n = [...data.sections]; n[sIdx].items = n[sIdx].items.filter((_, i) => i !== iIdx); updateData({ sections: n });
                                            }}>
                                                <FiTrash2 size={12} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="btn btn-sm btn-link text-primary w-100 text-decoration-none mt-1" onClick={() => {
                            const n = [...data.sections]; n[sIdx].items.push({ image: '', name: '', wikiLink: '' }); updateData({ sections: n });
                        }}>
                            <FiPlus size={12} className="me-1" /> {getTranslate('addItemBtn')}
                        </button>
                    </div>
                ))}

                <button className="btn btn-outline-primary w-100 rounded-pill py-2 border-dashed fw-bold mt-2" onClick={() => updateData({ sections: [...data.sections, { title: '', items: [] }] })}>
                    <FiPlus className="me-2" /> {getTranslate('addCategoryBtn')}
                </button>
            </div>
        </div>
    );
};

export default InfoboxEditor;