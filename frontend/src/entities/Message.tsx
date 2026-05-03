import User from "./User"

export default interface Message{
    id: number
    rootId: number
    parentId: number
    attachableType: string
    attachableId: number
    body: string
    user: User
    likesCount: number
    createdAt: string
    status: string
    new: boolean | null
    liked: boolean
}