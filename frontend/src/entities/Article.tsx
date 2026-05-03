import TranslationDTO from "./Translation";

export default interface Article{
    id: number
    name: string
    wikiId: number
    categoryId: number
    userId: number
    createdAt: string
    updatedAt: string
    transaltions: TranslationDTO[]
}

export default interface ArticleWithTranslation {
    id: number
    name: string
    wikiId: number
    categoryId: number
    userId: number
    createdAt: string
    updatedAt: string
    translations: TranslationDTO[]
    translation?: TranslationDTO | null
}