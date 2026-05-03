import User from "./User"
import Wiki from "./Wiki"

export default interface Post{
    id: number
    wiki: Wiki
    title: string
    body: string
    user: User
    likesCount: number
    createdAt: string
    updatedAt: string
    status: string
    liked: boolean
}