import User from "./User"

export default interface Post{
    id: number
    wikiId: number
    title: string
    body: string
    user: User
    likesCount: number
    createdAt: string
    updatedAt: string
    status: string
    liked: boolean
}