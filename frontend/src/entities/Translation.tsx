export default interface Translation{
    id: number
    translatableType: string
    translatableId: number
    locale: string
    title: string
    body: string
    infoboxData: string
    createdAt: string
    updatedAt: string
}

export default interface TranslationDTO {
    id: number
    locale: string
    title: string
}