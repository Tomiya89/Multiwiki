import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import ApiClient from '../../services/ApiClient';
import { FiSearch, FiLoader, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useLocale } from '../../contexts/LocaleContext';

interface SearchResult {
    id: number;
    locale: string;
    translatableType: string;
    title: string;
    url: string;
}

interface PageResponse {
    content: SearchResult[];
    totalPages: number;
    number: number;
    first: boolean;
    last: boolean;
}

const SearchPage = () => {
    const { getTranslate, setLocale} = useLocale();
    const { wikiName } = useParams<{ wikiName: string }>();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const [results, setResults] = useState<PageResponse | null>(null);
    const [loading, setLoading] = useState(false);

    const query = searchParams.get('query') || '';
    const page = parseInt(searchParams.get('page') || '0', 10);

    const fetchResults = async (q: string, p: number) => {
        setLoading(true);
        try {
            const data = await ApiClient.get<PageResponse>(
                `/wikis/${wikiName}/search?title=${encodeURIComponent(q)}&page=${p}&size=10`
            );
            setResults(data);
        } catch (err) {
            console.error("Search error", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResults(query, page);
    }, [query, page, wikiName]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const newQuery = formData.get('query') as string;
        setSearchParams({ query: newQuery, page: '0' });
    };

    const changePage = (newPage: number) => {
        setSearchParams({ query, page: newPage.toString() });
    };

    return (
        <div className="container py-3 py-md-5">
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <h2 className="mb-4">{getTranslate("searchWiki")}</h2>

                    <form onSubmit={handleSearch} className="mb-4">
                        <div className="input-group input-group-lg shadow-sm">
                            <input
                                name="query"
                                defaultValue={query}
                                className="form-control border-0"
                                placeholder={getTranslate('insertName')}
                            />
                            <button className="btn btn-primary px-4" type="submit">
                                {loading ? <FiLoader className="spin" /> : <FiSearch />}
                            </button>
                        </div>
                    </form>

                    {results && (
                        <div className="card border-0 shadow-sm">
                            <div className="list-group list-group-flush">
                                {results.content.length > 0 ? (
                                    results.content.map((item) => (
                                        <div
                                            key={item.id}
                                            className="list-group-item p-3 cursor-pointer hover-bg-light"
                                            onClick={() => {
                                                setLocale(item.locale);
                                                navigate(item.url)
                                            }}
                                        >
                                            <h5 className="mb-1 text-truncate">{item.title}</h5>
                                            <div className="d-flex gap-2">
                                                <span className="badge bg-secondary text-white">{item.locale}</span>
                                                <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                                                    {getTranslate(item.translatableType.toLowerCase())}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-5 text-center text-muted">{getTranslate('notFound')}</div>
                                )}
                            </div>

                            {results.totalPages > 1 && (
                                <div className="card-footer bg-white d-flex justify-content-between align-items-center py-3">
                                    <button
                                        className="btn btn-outline-secondary btn-sm"
                                        disabled={results.first}
                                        onClick={() => changePage(results.number - 1)}
                                    ><FiChevronLeft /> {getTranslate('backBtn')} </button>

                                    <span className="small text-muted">{results.number + 1} / {results.totalPages}</span>

                                    <button
                                        className="btn btn-outline-secondary btn-sm"
                                        disabled={results.last}
                                        onClick={() => changePage(results.number + 1)}
                                    >{getTranslate("forwardBtn")} <FiChevronRight /></button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchPage;