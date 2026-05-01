import User from "./User"

export default interface Staff{
    id: number
    wikiId: number
    userId: number
    role: string
    createdBy: number
    createdAt: string
    updatedAt: string
}

export default interface StaffDTO{
    id: number
    role: string
    user: User
}

export default interface StaffsCount{
    count: number
}