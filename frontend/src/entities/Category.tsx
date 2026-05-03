import TranslationDTO from "./Translation";

export default interface Category{
    id: number
    name: string
    wikiId: number
    userId: number
    createdAt: string
    updateAt: string
    translations: TranslationDTO[]
}

export default interface CategoryWithTranslation {
    id: number
    name: string
    wikiId: number
    userId: number
    createdAt: string
    updateAt: string
    translations: TranslationDTO[]
    translation?: TranslationDTO | null
}
