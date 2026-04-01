export default interface Message{
    id: number
    parentId: number
    attachableType: string
    attachableId: number
    body: string
    userId: number
    likesCount: number
    createdAt: string
}