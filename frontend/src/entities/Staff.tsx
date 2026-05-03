import User from "./User"
import Wiki from "./Wiki"

export default interface Staff{
    id: number
    wiki: Wiki
    user: User
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