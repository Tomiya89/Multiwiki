import Image from "./Image"

export default interface User{
    id: number
    email: string
    username: string
    avatar: Image
    role: string
    createdAt: string
}