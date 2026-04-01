export default interface Image{
    id: number
    userId: number
    type: string
    filename: string
    url: string
    fileSize: number
    createdAt: string
}

export function getFullImageURL(image: Image): string {
    const baseURL = import.meta.env.VITE_API_URL;
    return `${baseURL}/${image.url}`;
}