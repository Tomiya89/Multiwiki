import Image from "./Image";

import TranslationDTO from "./Translation";

export default interface Wiki {
    id: number
    name: string
    userId: number
    background: Image
    card: Image
    createdAt: string
    updateAt: string
    translations: TranslationDTO[]
}