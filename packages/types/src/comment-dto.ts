export interface CommentDto{
    id: number

    /**
     * 1: presale
     * 2: fairsale
     * 3: privatesale
     * 4: airdrop
     */
    projectType: number

    /**
     * current batch's starting actionState
     */
    projectAddress: string

    
    fromId: string

    
    toId: string

    
    parentCommentId: number

    comment: string

    signature: string

    updatedAt: Date

    createdAt: Date
}
