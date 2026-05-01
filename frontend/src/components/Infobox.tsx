import React from 'react';
import { Link } from 'react-router-dom';

interface SectionItem {
    image: string;
    name: string;
    wikiLink: string;
}

interface InfoboxSection {
    title: string;
    items: SectionItem[];
}

interface WikiInfoboxProps {
    infoboxDataString?: string;
    title?: string;
}

function Infobox ({ infoboxDataString, title } : WikiInfoboxProps){
    const data = React.useMemo(() => {
        try {
            return JSON.parse(infoboxDataString || '{}');
        } catch (e) {
            return {};
        }
    }, [infoboxDataString]);

    const { mainImage, fields = [], sections = [] } = data;

    if (!mainImage && fields.length === 0 && sections.length === 0) return null;

    return (
        <aside className="wiki-infobox card border-0 shadow-sm rounded-4 ms-lg-4 mb-4 float-lg-end"
            style={{ width: '320px', overflow: 'hidden', backgroundColor: '#f8fafc' }}>

            <div className="card-header bg-primary text-white text-center py-3 border-0">
                <h5 className="m-0 fw-bold">{title}</h5>
            </div>

            {mainImage && (
                <div className="p-2 bg-white">
                    <img src={mainImage} className="img-fluid rounded-3 w-100" alt={title} />
                </div>
            )}

            <div className="card-body p-3">

                {fields.length > 0 && (
                    <table className="table table-sm table-borderless mb-0" style={{ fontSize: '0.9rem' }}>
                        <tbody>
                            {fields.map((f: any, i: number) => (
                                <tr key={i} className="border-bottom border-light">
                                    <th className="text-muted fw-medium py-2 w-40">{f.key}</th>
                                    <td className="text-dark py-2 fw-semibold text-end">{f.value}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {sections.map((section: InfoboxSection, sIdx: number) => (
                    <div key={sIdx} className="mt-4">
                        <div className="section-title text-uppercase fw-bold text-muted mb-2" style={{ fontSize: '0.7rem' }}>
                            {section.title}
                        </div>
                        <div className="d-flex flex-wrap gap-2">
                            {section.items.map((item, iIdx) => (
                                <Link
                                    key={iIdx}
                                    to={`/wikis/${item.wikiLink}`}
                                    className="item-link d-flex align-items-center gap-2 p-1 pe-2 bg-white border rounded-pill shadow-sm"
                                    style={{ fontSize: '0.8rem' }}
                                >
                                    <div className="rounded-circle overflow-hidden border" style={{ width: '24px', height: '24px' }}>
                                        {item.image ? (
                                            <img src={item.image} className="w-100 h-100 object-fit-cover" alt="" />
                                        ) : (
                                            <div className="w-100 h-100 bg-light" />
                                        )}
                                    </div>
                                    <span className="fw-medium text-truncate" style={{ maxWidth: '100px' }}>
                                        {item.name}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </aside>
    );
};

export default Infobox;